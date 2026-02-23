"""
rule_checker.py
──────────────────────────────────────────────────────────────────────────────
ตรวจสอบกฎหมายควบคุมอาคาร (ประเทศไทย) จากข้อมูลที่สกัดได้จาก PDF

กฎหมายที่ครอบคลุม:
  • กฎกระทรวง ฉบับที่ 55 (พ.ศ. 2543)  ─── อาคารทั่วไป
  • กฎกระทรวง ฉบับที่ 39 (พ.ศ. 2537)  ─── ห้องน้ำ / ห้องส้วม
  • กฎกระทรวง ฉบับที่ 6  (พ.ศ. 2527)  ─── ระยะร่น (Setback)
  • พระราชบัญญัติควบคุมอาคาร 2522     ─── ขนาดช่องเปิด / ทางเดิน
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional


# ─────────────────────────────────────────────────────────────────────────────
#  Data structures
# ─────────────────────────────────────────────────────────────────────────────

@dataclass
class RuleCheck:
    rule_id: str
    rule_name_th: str
    passed: bool
    value: Optional[float]          # ค่าที่วัดได้จากแบบ (m หรือ m²)
    required: Optional[float]       # ค่าที่กฎหมายกำหนด
    unit: str = "m"
    detail: str = ""
    legal_reference: str = ""


@dataclass
class RuleCheckReport:
    overall_passed: bool
    checks: list[RuleCheck]
    warnings: list[str] = field(default_factory=list)

    # summary counts
    @property
    def passed_count(self) -> int:
        return sum(1 for c in self.checks if c.passed)

    @property
    def failed_count(self) -> int:
        return sum(1 for c in self.checks if not c.passed)

    def to_dict(self) -> dict:
        return {
            "overall_passed": self.overall_passed,
            "passed_count": self.passed_count,
            "failed_count": self.failed_count,
            "warnings": self.warnings,
            "checks": [
                {
                    "rule_id": c.rule_id,
                    "rule_name_th": c.rule_name_th,
                    "passed": c.passed,
                    "value": round(c.value, 3) if c.value is not None else None,
                    "required": round(c.required, 3) if c.required is not None else None,
                    "unit": c.unit,
                    "detail": c.detail,
                    "legal_reference": c.legal_reference,
                }
                for c in self.checks
            ],
        }


# ─────────────────────────────────────────────────────────────────────────────
#  Building type classification
# ─────────────────────────────────────────────────────────────────────────────

class BuildingType:
    DETACHED_HOUSE = "detached_house"       # บ้านเดี่ยว
    TOWNHOUSE      = "townhouse"            # บ้านแถว / ทาวน์เฮ้าส์
    APARTMENT      = "apartment"            # อาคารชุด (คอนโด)
    COMMERCIAL     = "commercial"           # อาคารพาณิชย์
    FACTORY        = "factory"              # โรงงาน


# ─────────────────────────────────────────────────────────────────────────────
#  Setback rules (กฎกระทรวง ฉบับที่ 55 + ฉบับที่ 6)
# ─────────────────────────────────────────────────────────────────────────────

# ระยะร่นจากถนน / แนวเขตที่ดิน หน่วยเมตร
SETBACK_RULES = {
    BuildingType.DETACHED_HOUSE: {
        "front_from_road_m": 2.00,     # ระยะร่นหน้า ≥ 2.0 ม. จากถนน (กว้าง<6m)
        "front_from_road_6m": 3.00,    # ถนนกว้าง 6-8 m → ร่น ≥ 3 m
        "side_m": 1.00,                # ระยะร่นข้าง ≥ 1.0 ม.
        "rear_m": 2.00,                # ระยะร่นหลัง ≥ 2.0 ม.
    },
    BuildingType.TOWNHOUSE: {
        "front_from_road_m": 2.00,
        "front_from_road_6m": 3.00,
        "side_m": 0.00,                 # บ้านแถวสามารถชิดข้างได้
        "rear_m": 2.00,
    },
    BuildingType.COMMERCIAL: {
        "front_from_road_m": 0.00,
        "front_from_road_6m": 0.00,
        "side_m": 0.00,
        "rear_m": 2.00,
    },
}


def check_setbacks(
    front_m: Optional[float],
    side_m: Optional[float],
    rear_m: Optional[float],
    building_type: str = BuildingType.DETACHED_HOUSE,
    road_width_m: float = 4.0,
) -> list[RuleCheck]:
    """
    ตรวจสอบระยะร่น 3 ด้าน (หน้า, ข้าง, หลัง)
    ค่า None = ไม่ได้วัด (ข้าม check นั้น)
    """
    rules = SETBACK_RULES.get(building_type, SETBACK_RULES[BuildingType.DETACHED_HOUSE])
    checks: list[RuleCheck] = []

    # หน้า
    req_front = rules["front_from_road_6m"] if road_width_m >= 6.0 else rules["front_from_road_m"]
    if front_m is not None:
        checks.append(RuleCheck(
            rule_id="SET-01",
            rule_name_th="ระยะร่นหน้า (จากถนนสาธารณะ)",
            passed=front_m >= req_front,
            value=front_m,
            required=req_front,
            unit="m",
            detail=f"ระยะวัดได้ {front_m:.2f} ม. | กำหนด ≥ {req_front:.2f} ม.",
            legal_reference="กฎกระทรวง ฉบับที่ 55 พ.ศ. 2543 ข้อ 34",
        ))

    # ข้าง
    req_side = rules["side_m"]
    if side_m is not None and req_side > 0:
        checks.append(RuleCheck(
            rule_id="SET-02",
            rule_name_th="ระยะร่นข้าง",
            passed=side_m >= req_side,
            value=side_m,
            required=req_side,
            unit="m",
            detail=f"ระยะวัดได้ {side_m:.2f} ม. | กำหนด ≥ {req_side:.2f} ม.",
            legal_reference="กฎกระทรวง ฉบับที่ 55 พ.ศ. 2543 ข้อ 35",
        ))

    # หลัง
    req_rear = rules["rear_m"]
    if rear_m is not None:
        checks.append(RuleCheck(
            rule_id="SET-03",
            rule_name_th="ระยะร่นหลัง",
            passed=rear_m >= req_rear,
            value=rear_m,
            required=req_rear,
            unit="m",
            detail=f"ระยะวัดได้ {rear_m:.2f} ม. | กำหนด ≥ {req_rear:.2f} ม.",
            legal_reference="กฎกระทรวง ฉบับที่ 55 พ.ศ. 2543 ข้อ 34-35",
        ))

    return checks


# ─────────────────────────────────────────────────────────────────────────────
#  Room area rules (พรบ. ควบคุมอาคาร 2522, กฎกระทรวง 55)
# ─────────────────────────────────────────────────────────────────────────────

MIN_ROOM_AREA = {
    "bedroom":         7.00,   # ห้องนอน ≥ 7 ตร.ม.
    "living":          9.00,   # ห้องนั่งเล่น ≥ 9 ตร.ม.
    "bathroom":        1.50,   # ห้องน้ำ ≥ 1.5 ตร.ม.
    "toilet":          0.90,   # ห้องส้วม ≥ 0.9 ตร.ม.
    "kitchen":         3.50,   # ครัว ≥ 3.5 ตร.ม.
    "corridor":        1.00,   # ทางเดินกว้าง ≥ 1.0 ม.
}

MIN_ROOM_WIDTH = {
    "bedroom":         2.00,   # ≥ 2.0 ม.
    "bathroom":        0.90,   # ≥ 0.90 ม.
}


def check_room_area(
    room_type: str,
    area_m2: float,
    width_m: Optional[float] = None,
) -> list[RuleCheck]:
    checks: list[RuleCheck] = []

    min_area = MIN_ROOM_AREA.get(room_type)
    if min_area:
        checks.append(RuleCheck(
            rule_id=f"ROOM-{room_type.upper()[:3]}-01",
            rule_name_th=f"พื้นที่ขั้นต่ำ {_ROOM_NAME_TH.get(room_type, room_type)}",
            passed=area_m2 >= min_area,
            value=area_m2,
            required=min_area,
            unit="m²",
            detail=f"พื้นที่วัดได้ {area_m2:.2f} ตร.ม. | กำหนด ≥ {min_area:.2f} ตร.ม.",
            legal_reference="กฎกระทรวง ฉบับที่ 55 พ.ศ. 2543",
        ))

    min_w = MIN_ROOM_WIDTH.get(room_type)
    if min_w and width_m is not None:
        checks.append(RuleCheck(
            rule_id=f"ROOM-{room_type.upper()[:3]}-02",
            rule_name_th=f"ความกว้างขั้นต่ำ {_ROOM_NAME_TH.get(room_type, room_type)}",
            passed=width_m >= min_w,
            value=width_m,
            required=min_w,
            unit="m",
            detail=f"กว้างวัดได้ {width_m:.2f} ม. | กำหนด ≥ {min_w:.2f} ม.",
            legal_reference="กฎกระทรวง ฉบับที่ 55 พ.ศ. 2543",
        ))

    return checks


_ROOM_NAME_TH = {
    "bedroom": "ห้องนอน",
    "living": "ห้องนั่งเล่น",
    "bathroom": "ห้องน้ำ",
    "toilet": "ห้องส้วม",
    "kitchen": "ห้องครัว",
    "corridor": "ทางเดิน",
}


# ─────────────────────────────────────────────────────────────────────────────
#  Sanitation rules (กฎกระทรวง ฉบับที่ 39 พ.ศ. 2537)
# ─────────────────────────────────────────────────────────────────────────────

def check_sanitation_count(
    occupant_count: int,
    toilet_count: int,
    building_type: str = BuildingType.DETACHED_HOUSE,
) -> RuleCheck:
    """
    จำนวนห้องน้ำ/ห้องส้วมตามกฎกระทรวง ฉบับที่ 39
    อาคารที่พักอาศัย: ผู้ใช้ ≤ 10 คน → ≥ 1 ชุด
                      ผู้ใช้ 11-20 คน → ≥ 2 ชุด
    """
    required = max(1, math.ceil(occupant_count / 10))
    return RuleCheck(
        rule_id="SAN-01",
        rule_name_th="จำนวนห้องน้ำ/ส้วมขั้นต่ำ",
        passed=toilet_count >= required,
        value=float(toilet_count),
        required=float(required),
        unit="ชุด",
        detail=f"ห้องน้ำ {toilet_count} ชุด | ผู้ใช้ {occupant_count} คน → ต้องการ ≥ {required} ชุด",
        legal_reference="กฎกระทรวง ฉบับที่ 39 พ.ศ. 2537 ข้อ 4",
    )


# ─────────────────────────────────────────────────────────────────────────────
#  Opening rules (พรบ. ควบคุมอาคาร 2522 + กฎกระทรวง 55)
# ─────────────────────────────────────────────────────────────────────────────

# ช่องแสง/ช่องลม ≥ 10% ของพื้นที่ห้อง (กฎกระทรวง 55 ข้อ 22)
_VENTILATION_RATIO = 0.10

def check_ventilation(room_area_m2: float, opening_area_m2: float) -> RuleCheck:
    req = room_area_m2 * _VENTILATION_RATIO
    return RuleCheck(
        rule_id="VENT-01",
        rule_name_th="พื้นที่ช่องแสง/ช่องลมขั้นต่ำ",
        passed=opening_area_m2 >= req,
        value=opening_area_m2,
        required=req,
        unit="m²",
        detail=f"ช่องเปิด {opening_area_m2:.3f} ตร.ม. | กำหนด ≥ {req:.3f} ตร.ม. (10% ของพื้นที่ {room_area_m2:.2f} ตร.ม.)",
        legal_reference="กฎกระทรวง ฉบับที่ 55 พ.ศ. 2543 ข้อ 22",
    )


# ─────────────────────────────────────────────────────────────────────────────
#  Floor Area Ratio (FAR) / Building Coverage Ratio (BCR)
# ─────────────────────────────────────────────────────────────────────────────

def check_far(
    total_floor_area_m2: float,
    land_area_m2: float,
    max_far: float = 2.0,
) -> RuleCheck:
    far = total_floor_area_m2 / land_area_m2 if land_area_m2 > 0 else 0
    return RuleCheck(
        rule_id="FAR-01",
        rule_name_th="อัตราส่วนพื้นที่อาคารต่อที่ดิน (FAR)",
        passed=far <= max_far,
        value=round(far, 3),
        required=max_far,
        unit="เท่า",
        detail=f"FAR = {total_floor_area_m2:.1f} / {land_area_m2:.1f} = {far:.2f} | กำหนด ≤ {max_far:.1f}",
        legal_reference="ผังเมืองรวม / กฎกระทรวงผังเมือง (แตกต่างตามโซน)",
    )


def check_bcr(
    footprint_area_m2: float,
    land_area_m2: float,
    max_bcr: float = 0.5,
) -> RuleCheck:
    bcr = footprint_area_m2 / land_area_m2 if land_area_m2 > 0 else 0
    return RuleCheck(
        rule_id="BCR-01",
        rule_name_th="อัตราส่วนพื้นที่ปกคลุม (BCR / Building Coverage Ratio)",
        passed=bcr <= max_bcr,
        value=round(bcr, 3),
        required=max_bcr,
        unit="เท่า",
        detail=f"BCR = {footprint_area_m2:.1f} / {land_area_m2:.1f} = {bcr:.2f} | กำหนด ≤ {max_bcr:.1f}",
        legal_reference="ผังเมืองรวม / กฎกระทรวงผังเมือง",
    )


# ─────────────────────────────────────────────────────────────────────────────
#  Aggregate: run all checks given extracted measurement dict
# ─────────────────────────────────────────────────────────────────────────────

def run_all_checks(measurements: dict) -> RuleCheckReport:
    """
    รันการตรวจสอบทั้งหมดจาก measurements dict

    measurements keys (all optional):
      building_type     str
      front_setback_m   float
      side_setback_m    float
      rear_setback_m    float
      road_width_m      float
      rooms             list[{type, area_m2, width_m}]
      toilet_count      int
      occupant_count    int
      total_floor_m2    float
      footprint_m2      float
      land_area_m2      float
    """
    checks: list[RuleCheck] = []
    warnings: list[str] = []
    btype = measurements.get("building_type", BuildingType.DETACHED_HOUSE)

    # Setbacks
    checks += check_setbacks(
        front_m=measurements.get("front_setback_m"),
        side_m=measurements.get("side_setback_m"),
        rear_m=measurements.get("rear_setback_m"),
        building_type=btype,
        road_width_m=measurements.get("road_width_m", 4.0),
    )

    # Rooms
    for room in measurements.get("rooms", []):
        rtype = room.get("type", "bedroom")
        area = room.get("area_m2")
        width = room.get("width_m")
        if area:
            checks += check_room_area(rtype, area, width)

    # Sanitation
    toilet_count = measurements.get("toilet_count")
    occupant_count = measurements.get("occupant_count")
    if toilet_count is not None and occupant_count is not None:
        checks.append(check_sanitation_count(occupant_count, toilet_count, btype))
    elif toilet_count is None:
        warnings.append("ไม่พบข้อมูลจำนวนห้องน้ำ – ข้าม SAN-01")

    # FAR / BCR
    total_floor = measurements.get("total_floor_m2")
    footprint = measurements.get("footprint_m2")
    land = measurements.get("land_area_m2")
    if total_floor and land:
        checks.append(check_far(total_floor, land))
    if footprint and land:
        checks.append(check_bcr(footprint, land))

    overall = all(c.passed for c in checks) if checks else False
    return RuleCheckReport(overall_passed=overall, checks=checks, warnings=warnings)


import math  # noqa: E402 (placed here to avoid circular; already imported above)
