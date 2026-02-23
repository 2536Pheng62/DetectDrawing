"""
PDF Analyzer Microservice
──────────────────────────────────────────────────────────────────────────────
FastAPI service สำหรับวิเคราะห์แบบแปลน 2D (PDF) เพื่อ Automated Rule Checking

Endpoints:
  GET  /health
  POST /parse-pdf          Full pipeline (vectors + scale calibration + rules)
  POST /extract-vectors    สกัด text/line vectors เท่านั้น (debug/preview)
  POST /detect-symbols     AI symbol detection เท่านั้น (debug/preview)

Architecture:
  PDF Upload → PyMuPDF (vector mode) ───── scale_calibration ──┐
                       ↓                                        ├──► rule_checker
             render to image → raster_processor ─ symbol_detector
"""

from __future__ import annotations

import os
import math
import tempfile
import traceback
from typing import Optional

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse

import fitz  # PyMuPDF

from scale_calibration import (
    calibrate_scale,
    CalibrationResult,
    extract_texts,
    extract_lines,
    pts_to_meters,
)
from raster_processor import (
    analyze_raster_page,
    compute_room_areas_m2,
    px_to_pts,
)
from symbol_detector import detect_symbols, convert_px_to_pts
from rule_checker import run_all_checks, BuildingType


# ─────────────────────────────────────────────────────────────────────────────
#  App setup
# ─────────────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="ARC PDF Analyzer",
    description=(
        "วิเคราะห์แบบแปลน 2D (PDF จาก CAD หรือสแกน) เพื่อตรวจสอบกฎหมายควบคุมอาคารไทย\n"
        "• Scale Calibration จาก Dimension Lines (มาตรฐาน ISO 4157)\n"
        "• Room Segmentation ด้วย OpenCV Contour Detection\n"
        "• Symbol Recognition ด้วย YOLO (สัญลักษณ์สุขภัณฑ์ ประตู หน้าต่าง)\n"
        "• ตรวจสอบ: ระยะร่น / พื้นที่ห้อง / FAR / BCR / สุขาภิบาล"
    ),
    version="1.0.0",
)


# ─────────────────────────────────────────────────────────────────────────────
#  Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _is_raster_page(page: fitz.Page) -> bool:
    """ตรวจว่าหน้า PDF มีเนื้อหาหลักเป็น raster image (สแกน) หรือ vector"""
    images = page.get_images()
    drawings = page.get_drawings()
    texts = page.get_text("dict").get("blocks", [])
    text_count = sum(1 for b in texts if b.get("type") == 0)

    # ถ้ามีรูปภาพมากกว่า drawings/text มาก → น่าจะเป็น raster
    return len(images) > 0 and len(drawings) < 10 and text_count < 5


def _serialize_line(line) -> dict:
    return {
        "x0": round(line.x0, 2), "y0": round(line.y0, 2),
        "x1": round(line.x1, 2), "y1": round(line.y1, 2),
        "length_pts": round(line.length_pts, 2),
        "is_horizontal": line.is_horizontal,
        "is_vertical": line.is_vertical,
    }


def _serialize_text(t) -> dict:
    return {
        "text": t.text,
        "bbox": [round(v, 2) for v in t.bbox],
        "font_size": round(t.font_size, 1),
    }


# ─────────────────────────────────────────────────────────────────────────────
#  /health
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "healthy", "service": "pdf-analyzer"}


# ─────────────────────────────────────────────────────────────────────────────
#  POST /extract-vectors  (debug endpoint)
# ─────────────────────────────────────────────────────────────────────────────

@app.post("/extract-vectors")
async def extract_vectors_endpoint(
    file: UploadFile = File(...),
    page_num: int = Form(0),
):
    """
    สกัด text spans + line segments จาก PDF page (vector mode)
    ไม่รัน rule checking – ใช้สำหรับ debug / preview ระบบ
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "ต้องเป็นไฟล์ .pdf")

    content = await file.read()
    fd, tmp = tempfile.mkstemp(suffix=".pdf")
    try:
        with os.fdopen(fd, "wb") as f:
            f.write(content)

        doc = fitz.open(tmp)
        if page_num >= len(doc):
            raise HTTPException(400, f"PDF มีเพียง {len(doc)} หน้า")

        page = doc[page_num]
        texts = extract_texts(page, page_num)
        lines = extract_lines(page)
        calib = calibrate_scale(page, page_num)

        return JSONResponse({
            "page_num": page_num,
            "page_size_pts": {"width": page.rect.width, "height": page.rect.height},
            "is_raster": _is_raster_page(page),
            "calibration": calib.to_dict(),
            "texts": [_serialize_text(t) for t in texts[:200]],   # cap at 200
            "lines": [_serialize_line(l) for l in lines[:500]],   # cap at 500
        })
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"เกิดข้อผิดพลาด: {e}\n{traceback.format_exc()}")
    finally:
        if os.path.exists(tmp):
            os.remove(tmp)


# ─────────────────────────────────────────────────────────────────────────────
#  POST /detect-symbols  (debug endpoint)
# ─────────────────────────────────────────────────────────────────────────────

@app.post("/detect-symbols")
async def detect_symbols_endpoint(
    file: UploadFile = File(...),
    page_num: int = Form(0),
    dpi: int = Form(200),
):
    """
    รัน YOLO symbol detection บนหน้า PDF (render เป็น image แล้ว detect)
    ไม่รัน rule checking
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "ต้องเป็นไฟล์ .pdf")

    content = await file.read()
    fd, tmp = tempfile.mkstemp(suffix=".pdf")
    try:
        with os.fdopen(fd, "wb") as f:
            f.write(content)

        doc = fitz.open(tmp)
        if page_num >= len(doc):
            raise HTTPException(400, f"PDF มีเพียง {len(doc)} หน้า")

        page = doc[page_num]
        from raster_processor import render_page_to_image
        img = render_page_to_image(page, dpi=dpi)

        det = detect_symbols(img)
        return JSONResponse(det.to_dict())

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"เกิดข้อผิดพลาด: {e}\n{traceback.format_exc()}")
    finally:
        if os.path.exists(tmp):
            os.remove(tmp)


# ─────────────────────────────────────────────────────────────────────────────
#  POST /parse-pdf  (full pipeline)
# ─────────────────────────────────────────────────────────────────────────────

@app.post("/parse-pdf")
async def parse_pdf(
    file: UploadFile = File(...),
    page_num: int = Form(0),
    dpi: int = Form(200),
    # Optional measurements override (สำหรับตรวจสอบกฎหมาย)
    building_type: str = Form(BuildingType.DETACHED_HOUSE),
    road_width_m: float = Form(4.0),
    land_area_m2: Optional[float] = Form(None),
    occupant_count: int = Form(4),
    run_raster: bool = Form(True),
    run_symbols: bool = Form(True),
    run_rules: bool = Form(True),
):
    """
    Full Analysis Pipeline:

    1. สกัด vectors + text (PyMuPDF)
    2. Scale Calibration จาก Dimension Lines
    3. วัดระยะร่น (setback) จาก title block หรือ extracted lines
    4. Room Segmentation (OpenCV) + คำนวณพื้นที่ m²
    5. Symbol Detection (YOLO)
    6. Rule Checking (กฎกระทรวง 55, 39, 6)
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "ต้องเป็นไฟล์ .pdf")

    content = await file.read()
    fd, tmp = tempfile.mkstemp(suffix=".pdf")
    try:
        with os.fdopen(fd, "wb") as f:
            f.write(content)

        doc = fitz.open(tmp)
        total_pages = len(doc)
        if page_num >= total_pages:
            raise HTTPException(400, f"PDF มีเพียง {total_pages} หน้า")

        page = doc[page_num]
        page_rect = page.rect
        is_raster = _is_raster_page(page)

        # ── Step 1 & 2: Vector extraction + Scale Calibration ─────────────────
        texts = extract_texts(page, page_num)
        lines = extract_lines(page)
        calib = calibrate_scale(page, page_num)
        pts_m = calib.pts_per_meter

        # ── Step 3: Estimate setbacks from bounding lines ─────────────────────
        # ค้นหาเส้นที่น่าจะเป็นขอบที่ดิน (เส้นยาวที่สุดหรือเส้นนอก)
        page_w_m = pts_to_meters(page_rect.width, calib)
        page_h_m = pts_to_meters(page_rect.height, calib)

        # Approximate setbacks: เส้นที่ใกล้ขอบกระดาษ ≤ 5% จากขอบ
        boundary_threshold_pts = page_rect.width * 0.05
        front_setback_m = _estimate_setback_from_lines(
            lines, calib, "front", page_rect, boundary_threshold_pts
        )
        side_setback_m = _estimate_setback_from_lines(
            lines, calib, "side", page_rect, boundary_threshold_pts
        )
        rear_setback_m = None  # ต้องการข้อมูลเพิ่มเติมจาก Title Block

        # ── Step 4 (optional): Raster analysis + Room Segmentation ───────────
        raster_result = None
        rooms_data: list[dict] = []
        if run_raster:
            raster_result = analyze_raster_page(page, dpi=dpi)
            rooms_with_area = compute_room_areas_m2(
                raster_result.rooms, dpi, pts_m
            )
            # สร้าง room data สำหรับ rule checking
            for i, room in enumerate(rooms_with_area):
                rx, ry, rw, rh = room.bbox_px
                width_m = pts_to_meters(px_to_pts(rw, dpi), calib)
                rooms_data.append({
                    "type": "bedroom",  # default; YOLO symbol จะ override ภายหลัง
                    "area_m2": room.area_m2,
                    "width_m": round(width_m, 3),
                    "bbox_px": [rx, ry, rw, rh],
                })

        # ── Step 5 (optional): Symbol Detection ───────────────────────────────
        symbol_result = None
        toilet_count = 0
        if run_symbols:
            from raster_processor import render_page_to_image
            img = render_page_to_image(page, dpi=dpi)
            symbol_result = detect_symbols(img)
            toilet_count = symbol_result.count("toilet") + symbol_result.count("urinal")

            # แปลง bbox px → pts
            for sym in symbol_result.symbols:
                convert_px_to_pts(sym, dpi)

        # ── Step 6 (optional): Rule Checking ──────────────────────────────────
        rule_report = None
        if run_rules:
            measurements = {
                "building_type": building_type,
                "front_setback_m": front_setback_m,
                "side_setback_m": side_setback_m,
                "rear_setback_m": rear_setback_m,
                "road_width_m": road_width_m,
                "rooms": rooms_data,
                "toilet_count": toilet_count if toilet_count > 0 else None,
                "occupant_count": occupant_count,
                "total_floor_m2": page_w_m * page_h_m if not land_area_m2 else None,
                "footprint_m2": None,
                "land_area_m2": land_area_m2,
            }
            rule_report = run_all_checks(measurements)

        # ── Assemble response ─────────────────────────────────────────────────
        response: dict = {
            "file_name": file.filename,
            "total_pages": total_pages,
            "analyzed_page": page_num,
            "page_size_pts": {
                "width": round(page_rect.width, 2),
                "height": round(page_rect.height, 2),
            },
            "page_size_m": {
                "width": round(page_w_m, 3),
                "height": round(page_h_m, 3),
            },
            "is_raster_page": is_raster,
            "scale_calibration": calib.to_dict(),
        }

        if front_setback_m is not None:
            response["estimated_setbacks_m"] = {
                "front": round(front_setback_m, 3),
                "side": round(side_setback_m, 3) if side_setback_m else None,
                "rear": None,
                "note": "ค่าประมาณจาก vector lines – ตรวจสอบกับ Drawing Notes",
            }

        if raster_result:
            response["raster_analysis"] = {
                "dpi": raster_result.dpi,
                "wall_lines_found": len(raster_result.wall_lines),
                "rooms_found": len(raster_result.rooms),
                "rooms": [
                    {
                        "area_m2": r.area_m2,
                        "bbox_px": list(r.bbox_px),
                    }
                    for r in (raster_result.rooms or [])
                ],
                "ocr_text_count": len(raster_result.ocr_texts),
                "scale_hint_from_ocr": raster_result.scale_text_hint,
                "warnings": raster_result.warnings,
            }

        if symbol_result:
            response["symbol_detection"] = symbol_result.to_dict()

        if rule_report:
            response["rule_check"] = rule_report.to_dict()

        return JSONResponse(response)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"เกิดข้อผิดพลาด: {e}\n{traceback.format_exc()}")
    finally:
        if os.path.exists(tmp):
            os.remove(tmp)


# ─────────────────────────────────────────────────────────────────────────────
#  Setback estimation from vector lines
# ─────────────────────────────────────────────────────────────────────────────

def _estimate_setback_from_lines(
    lines,
    calib: CalibrationResult,
    direction: str,
    rect: fitz.Rect,
    boundary_threshold: float,
) -> Optional[float]:
    """
    ประมาณระยะร่น (setback) โดยหา:
    1. "เส้นขอบที่ดิน" = เส้นยาวที่อยู่ใกล้ขอบกระดาษ
    2. "เส้นขอบอาคาร" = เส้นยาวถัดเข้าไป (parallel)
    3. ระยะห่างระหว่างสองเส้น = setback

    Returns: setback ในหน่วยเมตร หรือ None ถ้าหาไม่ได้
    """
    if direction == "front":
        # หาเส้นนอนที่อยู่ใกล้ขอบล่าง (y ใกล้ rect.y1)
        candidates = [
            l for l in lines
            if l.is_horizontal and l.length_pts > rect.width * 0.3
        ]
        if len(candidates) < 2:
            return None
        candidates.sort(key=lambda l: l.y0)  # เรียงจากบนลงล่าง

        # เส้นใกล้ขอบล่าง
        bottom_lines = [l for l in candidates if l.y0 > rect.y1 - boundary_threshold * 8]
        if not bottom_lines:
            return None
        inner_lines  = [l for l in candidates if l not in bottom_lines]
        if not inner_lines:
            return None

        boundary_y = sum(l.y0 for l in bottom_lines) / len(bottom_lines)
        building_y  = min(inner_lines, key=lambda l: abs(l.y0 - boundary_y + rect.height * 0.15)).y0
        gap_pts = abs(boundary_y - building_y)
        return round(pts_to_meters(gap_pts, calib), 3) if gap_pts > 0 else None

    elif direction == "side":
        # หาเส้นตั้งใกล้ขอบซ้าย
        candidates = [
            l for l in lines
            if l.is_vertical and l.length_pts > rect.height * 0.3
        ]
        if len(candidates) < 2:
            return None
        candidates.sort(key=lambda l: l.x0)

        left_lines = [l for l in candidates if l.x0 < rect.x0 + boundary_threshold * 8]
        if not left_lines:
            return None
        inner_lines = [l for l in candidates if l not in left_lines]
        if not inner_lines:
            return None

        boundary_x = sum(l.x0 for l in left_lines) / len(left_lines)
        building_x  = min(inner_lines, key=lambda l: abs(l.x0 - boundary_x - rect.width * 0.1)).x0
        gap_pts = abs(building_x - boundary_x)
        return round(pts_to_meters(gap_pts, calib), 3) if gap_pts > 0 else None

    return None
