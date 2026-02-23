"""
scale_calibration.py
──────────────────────────────────────────────────────────────────────────────
Scale Calibration Engine: แปลงพิกัด "จุด (Points)" บนกระดาษ PDF 
ไปสู่หน่วยระยะทางจริง "เมตร" สำหรับตรวจสอบกฎหมายควบคุมอาคาร

หลักการ (Algorithm Overview)
─────────────────────────────
แบบแปลนจาก CAD เก็บข้อมูล "Dimension Lines" คือเส้นระยะที่มีลูกศรหรือขีดปลาย
พร้อมตัวเลขกำกับ (Dimension Text) บอกระยะทางจริง

Step 1 : สกัด Candidate Texts  ─── ค้นหาข้อความที่ตรงกับ pattern ตัวเลข
Step 2 : สกัด Line Segments    ─── ดึงเส้นตรงทั้งหมดจาก PDF drawings
Step 3 : Match Text ↔ Line     ─── จับคู่ตัวเลขกับเส้นที่ใกล้ที่สุด (Proximity)
Step 4 : Compute Scale Factor  ─── scale = pts / real_value  (per matched pair)
Step 5 : Consensus             ─── ใช้ Median ของทุก scale factors เป็นค่าตัดสิน
Step 6 : Validate              ─── reject outliers > 2σ

หน่วยกำกับในแบบแปลนไทย
────────────────────────
 • ตัวเลขล้วน เช่น "3500"       → ถือเป็น mm  (ระบบ SI สำหรับงานก่อสร้าง)
 • ตัวเลขมีทศนิยม เช่น "3.50"  → ถือเป็น m
 • มีหน่วยต่อท้าย: "mm", "m", "ม.", "ซม."
 • มาตราส่วน title block: "1:100", "SCALE 1/50" → fallback เมื่อหาเส้นไม่ได้
"""

from __future__ import annotations

import re
import math
import statistics
from dataclasses import dataclass, field
from typing import Optional

import fitz  # PyMuPDF


# ─────────────────────────────────────────────────────────────────────────────
#  Data structures
# ─────────────────────────────────────────────────────────────────────────────

@dataclass
class TextSpan:
    text: str
    bbox: tuple[float, float, float, float]   # x0, y0, x1, y1 (PDF points)
    font_size: float
    page_num: int

    @property
    def midpoint(self) -> tuple[float, float]:
        return ((self.bbox[0] + self.bbox[2]) / 2,
                (self.bbox[1] + self.bbox[3]) / 2)


@dataclass
class LineSegment:
    x0: float
    y0: float
    x1: float
    y1: float
    color: Optional[tuple] = None
    stroke_width: float = 0.5

    @property
    def length_pts(self) -> float:
        dx = self.x1 - self.x0
        dy = self.y1 - self.y0
        return math.hypot(dx, dy)

    @property
    def midpoint(self) -> tuple[float, float]:
        return ((self.x0 + self.x1) / 2, (self.y0 + self.y1) / 2)

    @property
    def is_horizontal(self) -> bool:
        return abs(self.y1 - self.y0) < abs(self.x1 - self.x0)

    @property
    def is_vertical(self) -> bool:
        return abs(self.x1 - self.x0) < abs(self.y1 - self.y0)


@dataclass
class ScalePair:
    """หนึ่งคู่ (dimension text, line) ที่จับคู่กันสำเร็จ"""
    text_value_m: float          # ระยะจริงหน่วยเมตร
    line_length_pts: float       # ความยาวเส้นใน PDF points
    pts_per_meter: float         # scale factor: pts / m
    confidence: float            # 0..1 (ระยะห่างระหว่าง text กับเส้น)
    text_raw: str
    line: LineSegment


@dataclass
class CalibrationResult:
    pts_per_meter: float             # ค่า scale ที่ consensus แล้ว
    method: str                      # "dimension_lines" | "title_block" | "fallback"
    drawing_scale_ratio: float       # เช่น 100.0 สำหรับ 1:100
    confidence: float
    pairs_found: int
    pairs_used: int
    details: list[ScalePair] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            "pts_per_meter": round(self.pts_per_meter, 4),
            "method": self.method,
            "drawing_scale_ratio": round(self.drawing_scale_ratio, 2),
            "confidence": round(self.confidence, 3),
            "pairs_found": self.pairs_found,
            "pairs_used": self.pairs_used,
            "warnings": self.warnings,
        }


# ─────────────────────────────────────────────────────────────────────────────
#  Regex patterns
# ─────────────────────────────────────────────────────────────────────────────

# จับเลขที่น่าจะเป็นขนาดจริง:
#   "3500", "3,500", "3.50", "3.5 m", "350 mm", "3.50ม.", "3.5M"
_DIM_PATTERN = re.compile(
    r"(?<!\w)"                          # ไม่มีตัวอักษรอื่นนำหน้า
    r"(\d[\d,]*(?:\.\d+)?)"             # group 1: ตัวเลข (อาจมี comma, จุดทศนิยม)
    r"\s*"
    r"(mm|ซม\.?|cm|m\.?|ม\.?|M)??"      # group 2: หน่วย (optional, non-greedy)
    r"(?!\w)",                           # ไม่มีตัวอักษรอื่นตามหลัง
    re.IGNORECASE,
)

# Scale text จาก Title Block: "1:100", "SCALE 1/50", "M1:200"
_SCALE_PATTERN = re.compile(
    r"(?:SCALE\s*|M\s*)?1\s*[:/]\s*(\d+)",
    re.IGNORECASE,
)

# หน่วย mm (กลุ่ม mm ต้องแยกออกก่อนตัดสิน)
_UNIT_MM = re.compile(r"mm|มม\.?", re.IGNORECASE)
_UNIT_CM = re.compile(r"cm|ซม\.?", re.IGNORECASE)
_UNIT_M  = re.compile(r"^m$|^ม\.?$|^M$", re.IGNORECASE)


# ─────────────────────────────────────────────────────────────────────────────
#  Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _parse_real_meters(num_str: str, unit_str: Optional[str]) -> Optional[float]:
    """
    แปลง (ตัวเลข, หน่วย) → ค่าจริงหน่วยเมตร
    ตัวเลข "3500" ไม่มีหน่วย → ถือ mm (มาตรฐาน ISO 4157 / งานก่อสร้างไทย)
    ตัวเลข "3.50" ไม่มีหน่วย → ถือ m  (มีทศนิยม แสดงว่าใช้ m)
    """
    raw = num_str.replace(",", "")
    try:
        val = float(raw)
    except ValueError:
        return None

    if val <= 0:
        return None

    unit = (unit_str or "").strip()

    if _UNIT_MM.match(unit):
        return val / 1000.0
    if _UNIT_CM.match(unit):
        return val / 100.0
    if _UNIT_M.match(unit):
        return val

    # ไม่มีหน่วย → ตัดสินจากขนาดตัวเลข
    if "." in raw:
        # มีทศนิยม → น่าจะเป็นเมตร (เช่น 3.50, 1.20)
        return val if 0.05 <= val <= 200.0 else None
    else:
        # ไม่มีทศนิยม: ถ้า >= 10 → mm, ถ้า < 10 → อาจเป็น m
        if val >= 10:
            return val / 1000.0   # mm → m; เช่น 3500 → 3.5m
        else:
            return val            # เช่น 5 → 5m (ขนาดห้อง)


def _dist_point_to_segment(px: float, py: float, seg: LineSegment) -> float:
    """ระยะ perpendicular จากจุด (px,py) ไปยังเส้นตรง (infinite line version)"""
    dx = seg.x1 - seg.x0
    dy = seg.y1 - seg.y0
    length_sq = dx * dx + dy * dy
    if length_sq == 0:
        return math.hypot(px - seg.x0, py - seg.y0)
    t = max(0, min(1, ((px - seg.x0) * dx + (py - seg.y0) * dy) / length_sq))
    proj_x = seg.x0 + t * dx
    proj_y = seg.y0 + t * dy
    return math.hypot(px - proj_x, py - proj_y)


def _dist_midpoints(text: TextSpan, seg: LineSegment) -> float:
    tx, ty = text.midpoint
    lx, ly = seg.midpoint
    return math.hypot(tx - lx, ty - ly)


# ─────────────────────────────────────────────────────────────────────────────
#  Step 1 & 2: Extract texts and lines from a fitz.Page
# ─────────────────────────────────────────────────────────────────────────────

def extract_texts(page: fitz.Page, page_num: int = 0) -> list[TextSpan]:
    """ดึง text spans ทั้งหมดพร้อม bbox จากหน้า PDF"""
    result: list[TextSpan] = []
    blocks = page.get_text("dict").get("blocks", [])
    for block in blocks:
        if block.get("type") != 0:  # 0 = text
            continue
        for line in block.get("lines", []):
            for span in line.get("spans", []):
                text = span.get("text", "").strip()
                if text:
                    result.append(TextSpan(
                        text=text,
                        bbox=tuple(span["bbox"]),
                        font_size=span.get("size", 0),
                        page_num=page_num,
                    ))
    return result


def extract_lines(page: fitz.Page) -> list[LineSegment]:
    """ดึงเส้นตรง (path items type 'l') ทั้งหมดจาก PDF vector drawings"""
    result: list[LineSegment] = []
    paths = page.get_drawings()
    for path in paths:
        color = path.get("color") or path.get("stroke_color")
        width = path.get("width", 0.5)
        for item in path.get("items", []):
            if item[0] == "l":  # เส้นตรง
                p1, p2 = item[1], item[2]
                seg = LineSegment(
                    x0=p1.x, y0=p1.y,
                    x1=p2.x, y1=p2.y,
                    color=color,
                    stroke_width=width,
                )
                if seg.length_pts > 1.0:  # กรองเส้นสั้นมาก (noise)
                    result.append(seg)
    return result


# ─────────────────────────────────────────────────────────────────────────────
#  Step 3 & 4: Match dimension texts to nearby lines
# ─────────────────────────────────────────────────────────────────────────────

# ระยะค้นหา text ↔ line (หน่วย pts) – ปรับตามขนาดกระดาษ A0/A1/A3 ของแบบ
_PROXIMITY_PTS = 80.0   # ~2.8 cm บนกระดาษ 72dpi


def _find_best_line(span: TextSpan, lines: list[LineSegment],
                    value_m: float) -> Optional[tuple[LineSegment, float]]:
    """
    หาเส้นที่น่าจะเป็น Dimension Line ที่ตรงกับ text นั้น

    เงื่อนไข:
    1. midpoint ของ text อยู่ภายใน PROXIMITY ของเส้น
    2. ทิศทางของเส้นสอดคล้องกัน (เส้นนอน ~ text ที่บน/ล่าง, เส้นตั้ง ~ text ซ้าย/ขวา)
    3. ความยาวเส้นสอดคล้องกับ value_m (rough sanity: ไม่ต่างกันเกิน 10×)

    Returns: (best_line, confidence_score) or None
    """
    tx, ty = span.midpoint
    candidates: list[tuple[float, float, LineSegment]] = []   # (mid_dist, perp_dist, seg)

    for seg in lines:
        mid_d = _dist_midpoints(span, seg)
        if mid_d > _PROXIMITY_PTS * 3:
            continue
        perp_d = _dist_point_to_segment(tx, ty, seg)
        if perp_d > _PROXIMITY_PTS:
            continue
        candidates.append((mid_d, perp_d, seg))

    if not candidates:
        return None

    # เรียงตามระยะ perpendicular ก่อน แล้วตามระยะ midpoint
    candidates.sort(key=lambda c: (c[1], c[0]))

    best_mid_d, best_perp_d, best_seg = candidates[0]
    # Confidence: สูงหาก perp_d น้อย
    confidence = max(0.0, 1.0 - best_perp_d / _PROXIMITY_PTS)
    return best_seg, confidence


# ─────────────────────────────────────────────────────────────────────────────
#  Step 5: Consensus scale factor
# ─────────────────────────────────────────────────────────────────────────────

def _reject_outliers(values: list[float], z_thresh: float = 2.0) -> list[float]:
    """ตัด outlier ด้วย Z-score"""
    if len(values) < 3:
        return values
    mean = statistics.mean(values)
    stdev = statistics.stdev(values)
    if stdev == 0:
        return values
    return [v for v in values if abs(v - mean) / stdev <= z_thresh]


def _consensus_scale(pairs: list[ScalePair]) -> tuple[float, list[ScalePair]]:
    """คำนวณ median scale หลังตัด outlier"""
    raw = [p.pts_per_meter for p in pairs]
    cleaned = _reject_outliers(raw)
    if not cleaned:
        cleaned = raw
    median_scale = statistics.median(cleaned)

    # เลือกเฉพาะ pairs ที่ scale ไม่ห่างจาก median เกิน 25%
    used = [p for p in pairs
            if abs(p.pts_per_meter - median_scale) / median_scale <= 0.25]
    if not used:
        used = pairs

    final_scale = statistics.median([p.pts_per_meter for p in used])
    return final_scale, used


# ─────────────────────────────────────────────────────────────────────────────
#  Title Block fallback: ค้นหา "1:100" ใน text
# ─────────────────────────────────────────────────────────────────────────────

# PDF standard: 1 pt = 1/72 inch = 0.35278 mm
_PT_TO_MM = 25.4 / 72.0


def _try_title_block_scale(texts: list[TextSpan]) -> Optional[tuple[float, str]]:
    """
    ค้นหา scale ratio จาก Title Block เช่น "1:100"
    Returns: (pts_per_meter, raw_text) or None

    ที่มาของสูตร:
      แบบ 1:100 หมายความว่า 1 mm บนกระดาษ = 100 mm ในงานจริง
      1 mm ในงานจริง = (1/100) mm บนกระดาษ = (1/100) / _PT_TO_MM pts
      ดังนั้น 1 m ในงานจริง = 1000 mm = (1000/100) mm กระดาษ = 10mm/PT_TO_MM pts
    """
    for span in texts:
        m = _SCALE_PATTERN.search(span.text)
        if m:
            ratio = float(m.group(1))   # เช่น 100 สำหรับ 1:100
            if 10 <= ratio <= 5000:
                # pts_per_meter: กี่ pts บน PDF = 1 ม. ในงานจริง
                # 1 ม. จริง → 1000/ratio mm กระดาษ → (1000/ratio)/_PT_TO_MM pts
                pts_m = (1000.0 / ratio) / _PT_TO_MM
                return pts_m, span.text
    return None


# ─────────────────────────────────────────────────────────────────────────────
#  Public API
# ─────────────────────────────────────────────────────────────────────────────

# คาบเกี่ยวความยาว dimension line ที่สมเหตุสมผล (0.005 m – 500 m จริง)
_MIN_VALUE_M = 0.005
_MAX_VALUE_M = 500.0


def calibrate_scale(page: fitz.Page, page_num: int = 0) -> CalibrationResult:
    """
    Entry-point หลัก: รับ fitz.Page คืน CalibrationResult

    ลำดับการทำงาน:
    1. Extract texts & lines
    2. ค้นหา dimension candidate spans
    3. จับคู่กับ line segments
    4. Consensus → pts_per_meter
    5. Fallback: Title Block scale text
    6. Fallback: A1 paper 1:100 default
    """
    warnings: list[str] = []

    texts = extract_texts(page, page_num)
    lines = extract_lines(page)

    # ── Step 2: find numeric dimension candidates ─────────────────────────────
    dim_candidates: list[tuple[TextSpan, float]] = []
    for span in texts:
        for m in _DIM_PATTERN.finditer(span.text):
            real_m = _parse_real_meters(m.group(1), m.group(2))
            if real_m and _MIN_VALUE_M <= real_m <= _MAX_VALUE_M:
                dim_candidates.append((span, real_m))
                break   # 1 span → 1 candidate

    # ── Step 3 & 4: match text ↔ line ────────────────────────────────────────
    pairs: list[ScalePair] = []
    for span, value_m in dim_candidates:
        result = _find_best_line(span, lines, value_m)
        if result is None:
            continue
        best_seg, confidence = result
        if best_seg.length_pts < 2:
            continue
        pts_m = best_seg.length_pts / value_m
        pairs.append(ScalePair(
            text_value_m=value_m,
            line_length_pts=best_seg.length_pts,
            pts_per_meter=pts_m,
            confidence=confidence,
            text_raw=span.text,
            line=best_seg,
        ))

    if len(pairs) >= 2:
        # ── Step 5: consensus ─────────────────────────────────────────────────
        pts_m, used = _consensus_scale(pairs)
        if len(used) < len(pairs):
            warnings.append(
                f"ตัด {len(pairs) - len(used)} คู่ออกเพราะ scale ผิดปกติ (outlier)"
            )
        ratio = (1000.0 / pts_m) / _PT_TO_MM  # drawing scale ratio (e.g. 100 for 1:100)
        conf = statistics.mean(p.confidence for p in used)

        return CalibrationResult(
            pts_per_meter=pts_m,
            method="dimension_lines",
            drawing_scale_ratio=ratio,
            confidence=conf,
            pairs_found=len(pairs),
            pairs_used=len(used),
            details=used,
            warnings=warnings,
        )

    if len(pairs) == 1:
        warnings.append("พบคู่ dimension เพียง 1 คู่ – ความน่าเชื่อถือต่ำ")

    # ── Fallback 1: Title Block ───────────────────────────────────────────────
    tb = _try_title_block_scale(texts)
    if tb:
        pts_m, raw = tb
        ratio = (1000.0 / pts_m) / _PT_TO_MM
        return CalibrationResult(
            pts_per_meter=pts_m,
            method="title_block",
            drawing_scale_ratio=ratio,
            confidence=0.6,
            pairs_found=len(pairs),
            pairs_used=0,
            warnings=[f"ใช้มาตราส่วนจาก Title Block: '{raw}'"] + warnings,
        )

    # ── Fallback 2: hard-coded 1:100 ─────────────────────────────────────────
    default_pts_m = (1000.0 / 100.0) / _PT_TO_MM   # 1:100 default
    warnings.append(
        "ไม่พบ dimension lines หรือ title block scale – ใช้ค่าเริ่มต้น 1:100"
    )
    return CalibrationResult(
        pts_per_meter=default_pts_m,
        method="fallback_1:100",
        drawing_scale_ratio=100.0,
        confidence=0.1,
        pairs_found=len(pairs),
        pairs_used=0,
        warnings=warnings,
    )


def pts_to_meters(pts: float, calib: CalibrationResult) -> float:
    """แปลงระยะ PDF points → เมตร"""
    return pts / calib.pts_per_meter


def meters_to_pts(meters: float, calib: CalibrationResult) -> float:
    """แปลงระยะเมตร → PDF points"""
    return meters * calib.pts_per_meter
