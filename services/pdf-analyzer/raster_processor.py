"""
raster_processor.py
──────────────────────────────────────────────────────────────────────────────
โมดูลประมวลผลภาพ (Computer Vision) สำหรับ PDF ที่สแกนมาจากกระดาษ (Raster-based)
และ PDF ที่ต้องการวิเคราะห์ความหนาผนัง / นับสัญลักษณ์

Tools: OpenCV (cv2), PyMuPDF (render to numpy array), pytesseract (OCR)
"""

from __future__ import annotations

import math
import re
from dataclasses import dataclass, field
from typing import Optional

import numpy as np
import cv2
import fitz  # PyMuPDF

try:
    import pytesseract
    _HAS_TESSERACT = True
except ImportError:
    _HAS_TESSERACT = False


# ─────────────────────────────────────────────────────────────────────────────
#  Data structures
# ─────────────────────────────────────────────────────────────────────────────

@dataclass
class DetectedLine:
    x0: float; y0: float
    x1: float; y1: float
    angle_deg: float
    length_px: float

    @property
    def is_horizontal(self) -> bool:
        return abs(self.angle_deg) < 15 or abs(self.angle_deg) > 165

    @property
    def is_vertical(self) -> bool:
        return 75 < abs(self.angle_deg) < 105


@dataclass
class DetectedRoom:
    contour_pts: list
    area_px: float
    bbox_px: tuple[float, float, float, float]   # x, y, w, h
    area_m2: Optional[float] = None              # เติมหลัง scale calibration


@dataclass
class OCRTextResult:
    text: str
    bbox_px: tuple[float, float, float, float]
    confidence: float


@dataclass
class RasterAnalysisResult:
    dpi: int
    image_shape: tuple[int, int]
    wall_lines: list[DetectedLine]
    rooms: list[DetectedRoom]
    ocr_texts: list[OCRTextResult]
    scale_text_hint: Optional[str]     # เช่น "1:100" ที่พบจาก OCR
    warnings: list[str] = field(default_factory=list)


# ─────────────────────────────────────────────────────────────────────────────
#  Render PDF page to numpy image
# ─────────────────────────────────────────────────────────────────────────────

DEFAULT_DPI = 200   # 200 dpi: balance between accuracy & memory


def render_page_to_image(page: fitz.Page, dpi: int = DEFAULT_DPI) -> np.ndarray:
    """
    แปลง fitz.Page เป็น numpy array (BGR, uint8)
    dpi สูง = แม่นยำกว่า แต่ใช้ memory/CPU มากกว่า
    """
    zoom = dpi / 72.0
    mat = fitz.Matrix(zoom, zoom)
    pix = page.get_pixmap(matrix=mat, colorspace=fitz.csRGB, alpha=False)
    img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, 3)
    return cv2.cvtColor(img, cv2.COLOR_RGB2BGR)


# ─────────────────────────────────────────────────────────────────────────────
#  Wall Line Detection (HoughLinesP)
# ─────────────────────────────────────────────────────────────────────────────

def detect_wall_lines(
    img: np.ndarray,
    min_line_length_px: int = 50,
    max_gap_px: int = 15,
    canny_low: int = 50,
    canny_high: int = 150,
) -> list[DetectedLine]:
    """
    ตรวจจับเส้นผนังด้วย Canny Edge Detection + Probabilistic Hough Transform

    Parameters:
    ─────────────
    min_line_length_px : ความยาวเส้นต่ำสุดที่จะนับเป็นผนัง
    max_gap_px         : ช่องว่างสูงสุดที่ยังนับเป็นเส้นเดียวกัน
    """
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Denoise (แบบแปลนสแกนอาจมี noise)
    blurred = cv2.GaussianBlur(gray, (3, 3), 0)

    # Adaptive thresholding: ดีกว่า global threshold สำหรับแสงไม่สม่ำเสมอ
    thresh = cv2.adaptiveThreshold(
        blurred, 255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY_INV, 11, 2,
    )

    edges = cv2.Canny(thresh, canny_low, canny_high, apertureSize=3)

    # HoughLinesP: คืนค่า (x0, y0, x1, y1) per line
    raw_lines = cv2.HoughLinesP(
        edges,
        rho=1,
        theta=np.pi / 180,
        threshold=80,
        minLineLength=min_line_length_px,
        maxLineGap=max_gap_px,
    )

    result: list[DetectedLine] = []
    if raw_lines is None:
        return result

    for line_arr in raw_lines:
        x0, y0, x1, y1 = line_arr[0]
        length = math.hypot(x1 - x0, y1 - y0)
        angle = math.degrees(math.atan2(y1 - y0, x1 - x0))
        result.append(DetectedLine(x0=float(x0), y0=float(y0),
                                   x1=float(x1), y1=float(y1),
                                   angle_deg=angle, length_px=length))

    return result


# ─────────────────────────────────────────────────────────────────────────────
#  Room Segmentation (Contour Detection on closed wall polygons)
# ─────────────────────────────────────────────────────────────────────────────

def detect_rooms(
    img: np.ndarray,
    min_area_px: int = 5000,
    max_area_ratio: float = 0.9,
) -> list[DetectedRoom]:
    """
    ตรวจจับห้อง (ขอบเขตปิดล้อม) โดยใช้ Contour Detection

    Algorithm:
    1. แปลงเป็น grayscale + threshold
    2. Morphological Close: ปิดช่องว่างในผนัง
    3. Flood-fill จากมุมภาพ → กำหนด background
    4. findContours → หา contours ขนาดพอเหมาะ (เป็นห้อง)
    """
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, binary = cv2.threshold(gray, 200, 255, cv2.THRESH_BINARY_INV)

    # Morphological operations: ปิดผนังที่ขาดหาย
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
    closed = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel, iterations=3)

    contours, _ = cv2.findContours(closed, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_SIMPLE)

    img_area = img.shape[0] * img.shape[1]
    rooms: list[DetectedRoom] = []

    for contour in contours:
        area = cv2.contourArea(contour)
        if area < min_area_px:
            continue
        if area / img_area > max_area_ratio:
            continue   # ข้าม contour ทั้งหน้า

        x, y, w, h = cv2.boundingRect(contour)
        rooms.append(DetectedRoom(
            contour_pts=contour.tolist(),
            area_px=float(area),
            bbox_px=(float(x), float(y), float(w), float(h)),
        ))

    return rooms


# ─────────────────────────────────────────────────────────────────────────────
#  OCR: Extract text from raster image (Tesseract)
# ─────────────────────────────────────────────────────────────────────────────

_SCALE_RE = re.compile(r"1\s*[:/]\s*(\d{2,4})", re.IGNORECASE)


def run_ocr(img: np.ndarray) -> tuple[list[OCRTextResult], Optional[str]]:
    """
    รัน Tesseract OCR บน raster image
    Returns: (text_results, scale_hint_or_None)
    
    Tesseract config: ใช้ Thai + English, PSM 11 = sparse text
    """
    if not _HAS_TESSERACT:
        return [], None

    # Preprocessing สำหรับ OCR: upscale + binary
    scale_factor = 2.0 if img.shape[0] < 1000 else 1.0
    if scale_factor > 1.0:
        img = cv2.resize(img, None, fx=scale_factor, fy=scale_factor,
                          interpolation=cv2.INTER_CUBIC)

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, binary = cv2.threshold(gray, 180, 255, cv2.THRESH_BINARY)

    data = pytesseract.image_to_data(
        binary,
        lang="tha+eng",
        config="--psm 11 --oem 3",
        output_type=pytesseract.Output.DICT,
    )

    results: list[OCRTextResult] = []
    scale_hint: Optional[str] = None
    n = len(data["text"])

    for i in range(n):
        text = data["text"][i].strip()
        conf = float(data["conf"][i])
        if not text or conf < 30:
            continue

        x = data["left"][i] / scale_factor
        y = data["top"][i] / scale_factor
        w = data["width"][i] / scale_factor
        h = data["height"][i] / scale_factor

        results.append(OCRTextResult(
            text=text,
            bbox_px=(x, y, w, h),
            confidence=conf / 100.0,
        ))

        if scale_hint is None:
            m = _SCALE_RE.search(text)
            if m:
                scale_hint = text

    return results, scale_hint


# ─────────────────────────────────────────────────────────────────────────────
#  Public entry-point
# ─────────────────────────────────────────────────────────────────────────────

def analyze_raster_page(page: fitz.Page, dpi: int = DEFAULT_DPI) -> RasterAnalysisResult:
    """
    Full raster analysis pipeline สำหรับหน้า PDF หนึ่งหน้า
    ใช้เมื่อ: PDF มาจากการสแกน หรือต้องการ Room Segmentation
    """
    warnings: list[str] = []

    img = render_page_to_image(page, dpi=dpi)
    h, w = img.shape[:2]

    wall_lines = detect_wall_lines(img)
    rooms = detect_rooms(img)

    ocr_texts: list[OCRTextResult] = []
    scale_hint: Optional[str] = None

    if _HAS_TESSERACT:
        ocr_texts, scale_hint = run_ocr(img)
    else:
        warnings.append(
            "pytesseract ไม่พร้อมใช้งาน – ข้าม OCR "
            "(ติดตั้ง Tesseract + pytesseract เพื่อเปิดใช้งาน)"
        )

    return RasterAnalysisResult(
        dpi=dpi,
        image_shape=(h, w),
        wall_lines=wall_lines,
        rooms=rooms,
        ocr_texts=ocr_texts,
        scale_text_hint=scale_hint,
        warnings=warnings,
    )


def px_to_pts(px: float, dpi: int) -> float:
    """แปลงพิกเซล (raster) → PDF points (72 dpi = 1pt)"""
    return px * 72.0 / dpi


def compute_room_areas_m2(
    rooms: list[DetectedRoom],
    dpi: int,
    pts_per_meter: float,
) -> list[DetectedRoom]:
    """
    คำนวณพื้นที่ห้องเป็น m² หลังจาก scale calibration
    area_px → area_pts² → area_m²
    """
    px_per_pt = dpi / 72.0
    pt_per_px = 1.0 / px_per_pt
    m_per_pt = 1.0 / pts_per_meter
    m_per_px = pt_per_px * m_per_pt

    for room in rooms:
        room.area_m2 = round(room.area_px * (m_per_px ** 2), 2)
    return rooms
