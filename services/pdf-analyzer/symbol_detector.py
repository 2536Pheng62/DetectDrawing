"""
symbol_detector.py
──────────────────────────────────────────────────────────────────────────────
AI-based Symbol Recognition โดยใช้ Ultralytics YOLO
สำหรับตรวจจับสัญลักษณ์ทางสถาปัตยกรรมในแบบแปลน 2D

สัญลักษณ์เป้าหมาย (ฝึก Custom Model):
  • toilet / urinal         ─── โถส้วม / โถปัสสาวะ (กฎกระทรวง ฉบับที่ 39)
  • door / door_swing       ─── ประตู + รัศมีการเปิด
  • window                  ─── หน้าต่าง
  • stair                   ─── บันได
  • column                  ─── เสา (สี่เหลี่ยม)
  • elevator                ─── ลิฟต์
  • fire_exit               ─── ประตูหนีไฟ

⚠️  สถานะ: STUB – ต้องฝึกโมเดล YOLO ด้วย Dataset สัญลักษณ์แบบแปลนไทย
    เมื่อมีโมเดลแล้ว ให้วาง weights ที่ MODEL_PATH แล้ว stub จะถูกแทนที่โดยอัตโนมัติ
"""

from __future__ import annotations

import os
import logging
from dataclasses import dataclass
from typing import Optional

import numpy as np

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────────────────
#  YOLO model path & class list (update when trained model is ready)
# ─────────────────────────────────────────────────────────────────────────────

MODEL_PATH = os.environ.get(
    "SYMBOL_MODEL_PATH",
    "/app/models/floorplan_symbols.pt",   # mount model file ผ่าน Docker volume
)

CLASS_NAMES = [
    "toilet", "urinal", "door", "door_swing",
    "window", "stair", "column", "elevator", "fire_exit", "sink",
]

CONFIDENCE_THRESHOLD = float(os.environ.get("SYMBOL_CONF_THRESHOLD", "0.40"))


# ─────────────────────────────────────────────────────────────────────────────
#  Data structures
# ─────────────────────────────────────────────────────────────────────────────

@dataclass
class DetectedSymbol:
    class_name: str
    class_id: int
    confidence: float
    bbox_px: tuple[float, float, float, float]   # x_center, y_center, w, h
    bbox_pts: Optional[tuple[float, float, float, float]] = None  # เติมหลัง scale


@dataclass
class SymbolDetectionResult:
    symbols: list[DetectedSymbol]
    model_used: str           # "yolo" | "stub"
    model_path: str
    warnings: list[str]

    # quick-access counts per class
    def count(self, class_name: str) -> int:
        return sum(1 for s in self.symbols if s.class_name == class_name)

    def to_dict(self) -> dict:
        counts: dict[str, int] = {}
        for s in self.symbols:
            counts[s.class_name] = counts.get(s.class_name, 0) + 1
        return {
            "model_used": self.model_used,
            "total_symbols": len(self.symbols),
            "counts_per_class": counts,
            "warnings": self.warnings,
            "detections": [
                {
                    "class_name": s.class_name,
                    "confidence": round(s.confidence, 3),
                    "bbox_px": list(s.bbox_px),
                }
                for s in self.symbols
            ],
        }


# ─────────────────────────────────────────────────────────────────────────────
#  Load YOLO model (lazy, singleton)
# ─────────────────────────────────────────────────────────────────────────────

_model = None
_model_loaded = False


def _load_model():
    global _model, _model_loaded
    if _model_loaded:
        return _model
    if not os.path.exists(MODEL_PATH):
        logger.warning("Symbol model not found at %s – running in stub mode", MODEL_PATH)
        _model = None
    else:
        try:
            from ultralytics import YOLO
            _model = YOLO(MODEL_PATH)
            logger.info("YOLO symbol model loaded: %s", MODEL_PATH)
        except Exception as e:
            logger.error("Failed to load YOLO model: %s", e)
            _model = None
    _model_loaded = True
    return _model


# ─────────────────────────────────────────────────────────────────────────────
#  Stub: rule-based detection (ใช้ก่อนที่โมเดล YOLO จะพร้อม)
# ─────────────────────────────────────────────────────────────────────────────

def _stub_detect(img: np.ndarray) -> list[DetectedSymbol]:
    """
    Stub detector: ใช้ OpenCV template matching แบบง่ายๆ เพื่อทดสอบ pipeline
    ก่อนที่โมเดล YOLO จะถูกฝึก

    ในการใช้งานจริง: แทนด้วย YOLO inference
    """
    import cv2

    symbols: list[DetectedSymbol] = []

    # ตัวแทน: นับ "วงกลมเล็กๆ" ซึ่งมักเป็นสัญลักษณ์โถส้วมในแบบแปลน
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (9, 9), 2)

    circles = cv2.HoughCircles(
        blurred,
        cv2.HOUGH_GRADIENT,
        dp=1.2,
        minDist=40,
        param1=100,
        param2=30,
        minRadius=15,
        maxRadius=80,
    )

    if circles is not None:
        for cx, cy, r in circles[0]:
            symbols.append(DetectedSymbol(
                class_name="toilet",   # placeholder
                class_id=0,
                confidence=0.30,       # low confidence = stub
                bbox_px=(float(cx), float(cy), float(r * 2), float(r * 2)),
            ))

    return symbols


# ─────────────────────────────────────────────────────────────────────────────
#  Public API
# ─────────────────────────────────────────────────────────────────────────────

def detect_symbols(img: np.ndarray) -> SymbolDetectionResult:
    """
    ตรวจจับสัญลักษณ์สถาปัตยกรรมบน numpy image (BGR)
    ใช้ YOLO ถ้ามีโมเดล มิฉะนั้น fallback stub
    """
    model = _load_model()
    warnings: list[str] = []

    if model is not None:
        # ── Real YOLO inference ──────────────────────────────────────────────
        results = model.predict(
            img,
            conf=CONFIDENCE_THRESHOLD,
            verbose=False,
        )
        symbols: list[DetectedSymbol] = []
        for r in results:
            for box in r.boxes:
                cls_id = int(box.cls[0])
                cls_name = CLASS_NAMES[cls_id] if cls_id < len(CLASS_NAMES) else f"class_{cls_id}"
                conf = float(box.conf[0])
                x_c, y_c, w, h = box.xywh[0].tolist()
                symbols.append(DetectedSymbol(
                    class_name=cls_name,
                    class_id=cls_id,
                    confidence=conf,
                    bbox_px=(x_c, y_c, w, h),
                ))
        return SymbolDetectionResult(
            symbols=symbols,
            model_used="yolo",
            model_path=MODEL_PATH,
            warnings=warnings,
        )

    else:
        # ── Stub mode ────────────────────────────────────────────────────────
        symbols = _stub_detect(img)
        warnings.append(
            f"ไม่พบ YOLO model ที่ {MODEL_PATH} – ใช้ Stub detector (ความแม่นยำต่ำ) "
            "กรุณาวางไฟล์ weights ที่ถูกฝึกแล้วเพื่อเปิดใช้งาน YOLO"
        )
        return SymbolDetectionResult(
            symbols=symbols,
            model_used="stub",
            model_path=MODEL_PATH,
            warnings=warnings,
        )


def convert_px_to_pts(sym: DetectedSymbol, dpi: int) -> DetectedSymbol:
    """แปลง bbox จาก pixel → PDF points"""
    scale = 72.0 / dpi
    cx, cy, w, h = sym.bbox_px
    sym.bbox_pts = (cx * scale, cy * scale, w * scale, h * scale)
    return sym
