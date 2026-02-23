"""
OpenSees Engine – Seismic Cross-Check Microservice
----------------------------------------------------
ใช้ OpenSeesPy สร้างโมเดล Shear-Building แบบ N ชั้น
แล้วรัน Modal Analysis เทียบกับ Design Spectrum มาตรฐาน มยผ. 1302-52
เพื่อ Cross-check ค่า Base Shear / Story Drift ที่วิศวกรส่งมา
"""

from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator
from typing import List, Optional
import numpy as np
import traceback

# OpenSeesPy — graceful fallback so container stays up even if native libs missing
try:
    import openseespy.opensees as ops
    OPENSEES_AVAILABLE = True
except Exception as _oe:
    ops = None  # type: ignore
    OPENSEES_AVAILABLE = False
    import warnings
    warnings.warn(f"openseespy not available: {_oe}. Endpoints will return 503.")

app = FastAPI(
    title="ARC OpenSees Engine",
    description="Seismic dynamic analysis microservice for Thai มยผ. 1302-52 standard cross-check",
    version="1.0.0",
)


# ─────────────────────────────────────────────
#  Pydantic Models
# ─────────────────────────────────────────────

class StoryData(BaseModel):
    """ข้อมูลแต่ละชั้น"""
    height_m: float = Field(..., gt=0, description="ความสูงชั้น (เมตร)")
    dead_load_kn: float = Field(..., ge=0, description="น้ำหนักบรรทุกคงที่ต่อชั้น DL (kN)")
    live_load_kn: float = Field(..., ge=0, description="น้ำหนักบรรทุกจร LL (kN)")
    lateral_stiffness_kn_m: float = Field(..., gt=0, description="ความแข็งแรงด้านข้าง k_i (kN/m)")


class SeismicCheckInput(BaseModel):
    """Input สำหรับการตรวจสอบแผ่นดินไหว"""
    project_name: str = Field("Unnamed Project", description="ชื่อโครงการ")
    seismic_zone: int = Field(..., ge=1, le=3, description="โซนแผ่นดินไหว มยผ. (1=กทม., 2=ภาคเหนือ, 3=ชายแดน)")
    site_class: str = Field("C", description="ประเภทชั้นดิน (A, B, C, D, E)")
    structural_system: str = Field("OMRF", description="ระบบโครงสร้าง: OMRF, IMRF, SMRF")
    stories: List[StoryData] = Field(..., min_items=1, max_items=50)

    # ค่าที่วิศวกรส่งมา (optional – ใช้สำหรับ cross-check)
    engineer_base_shear_kn: Optional[float] = Field(None, ge=0, description="Base Shear ที่วิศวกรคำนวณ (kN)")
    engineer_max_story_drift_mm: Optional[float] = Field(None, ge=0, description="Story Drift สูงสุดที่วิศวกรรายงาน (mm)")
    engineer_fundamental_period_s: Optional[float] = Field(None, ge=0, description="คาบธรรมชาติ T ที่วิศวกรรายงาน (วินาที)")

    @validator("site_class")
    def validate_site_class(cls, v):
        allowed = ["A", "B", "C", "D", "E"]
        v = v.upper()
        if v not in allowed:
            raise ValueError(f"site_class ต้องเป็น {allowed}")
        return v

    @validator("structural_system")
    def validate_structural_system(cls, v):
        allowed = ["OMRF", "IMRF", "SMRF"]
        v = v.upper()
        if v not in allowed:
            raise ValueError(f"structural_system ต้องเป็น {allowed}")
        return v


# ─────────────────────────────────────────────
#  มยผ. 1302-52 Design Spectrum Parameters
# ─────────────────────────────────────────────

# Ground motion parameters per มยผ. 1302-52 Table 3-2 (2% in 50 years, MCE level)
# Mapped spectral accelerations (ss = 0.2s, s1 = 1.0s) per zone
ZONE_GROUND_MOTION = {
    1: {"Ss": 0.40, "S1": 0.16},   # Zone 1: กรุงเทพฯ และส่วนใหญ่ของไทย
    2: {"Ss": 0.80, "S1": 0.32},   # Zone 2: เชียงใหม่, ลำปาง, แม่ฮ่องสอน
    3: {"Ss": 1.60, "S1": 0.64},   # Zone 3: ชายแดนเชียงราย (อ.พญาเม็งราย)
}

# Site coefficients Fa (short period) per มยผ. 1302-52 Table 3-4
FA_TABLE = {
    "A": {0.25: 0.8, 0.50: 0.8, 0.75: 0.8, 1.00: 0.8, 1.25: 0.8},
    "B": {0.25: 1.0, 0.50: 1.0, 0.75: 1.0, 1.00: 1.0, 1.25: 1.0},
    "C": {0.25: 1.2, 0.50: 1.2, 0.75: 1.1, 1.00: 1.0, 1.25: 1.0},
    "D": {0.25: 1.6, 0.50: 1.4, 0.75: 1.2, 1.00: 1.1, 1.25: 1.0},
    "E": {0.25: 2.5, 0.50: 1.7, 0.75: 1.2, 1.00: 0.9, 1.25: 0.9},
}

# Site coefficients Fv (long period) per มยผ. 1302-52 Table 3-5
FV_TABLE = {
    "A": {0.1: 0.8, 0.2: 0.8, 0.3: 0.8, 0.4: 0.8, 0.5: 0.8},
    "B": {0.1: 1.0, 0.2: 1.0, 0.3: 1.0, 0.4: 1.0, 0.5: 1.0},
    "C": {0.1: 1.7, 0.2: 1.6, 0.3: 1.5, 0.4: 1.4, 0.5: 1.3},
    "D": {0.1: 2.4, 0.2: 2.0, 0.3: 1.8, 0.4: 1.6, 0.5: 1.5},
    "E": {0.1: 3.5, 0.2: 3.2, 0.3: 2.8, 0.4: 2.4, 0.5: 2.4},
}

# Response Modification Factor R per มยผ. 1302-52 Table 3-3
R_FACTORS = {
    "OMRF": 3.0,   # Ordinary Moment Resisting Frame (โครงต้านแรงดัดสามัญ)
    "IMRF": 5.0,   # Intermediate Moment Resisting Frame (โครงต้านแรงดัดปานกลาง)
    "SMRF": 8.0,   # Special Moment Resisting Frame (โครงต้านแรงดัดพิเศษ)
}

# Story drift limit per มยผ. 1302-52 Table 4-2
DRIFT_LIMIT_RATIO = 0.02  # 2% of story height (life safety level)


def interpolate_fa(site_class: str, ss: float) -> float:
    """Interpolate Fa coefficient from มยผ. table"""
    table = FA_TABLE.get(site_class, FA_TABLE["C"])
    keys = sorted(table.keys())
    ss_clamped = max(keys[0], min(ss, keys[-1]))
    # Linear interpolation
    for i in range(len(keys) - 1):
        if keys[i] <= ss_clamped <= keys[i + 1]:
            t = (ss_clamped - keys[i]) / (keys[i + 1] - keys[i])
            return table[keys[i]] + t * (table[keys[i + 1]] - table[keys[i]])
    return table[keys[-1]]


def interpolate_fv(site_class: str, s1: float) -> float:
    """Interpolate Fv coefficient from มยผ. table"""
    table = FV_TABLE.get(site_class, FV_TABLE["C"])
    keys = sorted(table.keys())
    s1_clamped = max(keys[0], min(s1, keys[-1]))
    for i in range(len(keys) - 1):
        if keys[i] <= s1_clamped <= keys[i + 1]:
            t = (s1_clamped - keys[i]) / (keys[i + 1] - keys[i])
            return table[keys[i]] + t * (table[keys[i + 1]] - table[keys[i]])
    return table[keys[-1]]


def compute_design_spectrum(seismic_zone: int, site_class: str):
    """
    คำนวณ Design Spectrum ตามมยผ. 1302-52
    Returns: SDS, SD1, T0, Ts, TL (s)
    """
    gm = ZONE_GROUND_MOTION[seismic_zone]
    Ss, S1 = gm["Ss"], gm["S1"]

    Fa = interpolate_fa(site_class, Ss)
    Fv = interpolate_fv(site_class, S1)

    SMS = Fa * Ss          # MCER spectral acceleration at short period
    SM1 = Fv * S1          # MCER spectral acceleration at 1-s period

    SDS = (2.0 / 3.0) * SMS  # Design spectral acceleration (short period)
    SD1 = (2.0 / 3.0) * SM1  # Design spectral acceleration (1-s period)

    T0 = 0.2 * (SD1 / SDS)   # Transition period (start of plateau)
    Ts = SD1 / SDS             # Transition period (end of plateau)
    TL = 16.0                  # Long-period transition (s), มยผ. ใช้ 16 วินาที

    return {"SDS": SDS, "SD1": SD1, "T0": T0, "Ts": Ts, "TL": TL, "Fa": Fa, "Fv": Fv}


def get_sa(T: float, spectrum: dict) -> float:
    """
    ค่า Spectral Acceleration Sa(T) จาก Design Spectrum มยผ. 1302-52
    """
    SDS, SD1, T0, Ts, TL = (
        spectrum["SDS"], spectrum["SD1"],
        spectrum["T0"], spectrum["Ts"], spectrum["TL"],
    )
    if T <= 0:
        return SDS
    elif T <= T0:
        return SDS * (0.4 + 0.6 * T / T0)
    elif T <= Ts:
        return SDS
    elif T <= TL:
        return SD1 / T
    else:
        return SD1 * TL / (T * T)


# ─────────────────────────────────────────────
#  OpenSees Shear-Building Modal Analysis
# ─────────────────────────────────────────────

def run_opensees_modal_analysis(masses_kg: List[float], stiffnesses_kn_m: List[float]):
    """
    สร้าง Shear-Building ใน OpenSees และรัน Eigenvalue Analysis
    
    Returns: dict with natural_periods, mode_shapes, modal_masses
    """
    ops.wipe()
    n = len(masses_kg)
    
    # Model: 1D, 1 DOF per node (horizontal translation)
    # ใช้ 2D model แต่ fix ทิศตั้ง และหมุน
    ops.model("basic", "-ndm", 2, "-ndf", 3)

    # nodes: 0 = base, 1..n = floors
    for i in range(n + 1):
        h = 0.0 if i == 0 else float(i)
        ops.node(i, 0.0, h)

    # fix base node (all DOFs)
    ops.fix(0, 1, 1, 1)

    # fix vertical and rotation DOFs at all floor nodes
    for i in range(1, n + 1):
        ops.fix(i, 0, 1, 1)   # free X, fixed Y, fixed Rz

    # mass at each floor node (X direction only)
    g = 9.81  # m/s²
    for i in range(1, n + 1):
        m = masses_kg[i - 1]
        ops.mass(i, m, 0.0, 0.0)

    # Zero-Length spring elements to model story shear stiffness
    # น้ำหนักหน่วยของ k ใช้ kN/m → convert to N/m for consistency
    # แต่เนื่องจากเราใช้ SI, mass ใส่เป็น kg → F=ma (N)
    # k ใส่เป็น N/m → multiply kN/m by 1000
    ops.uniaxialMaterial("Elastic", 1, 1.0)  # placeholder, overridden per element

    for i in range(n):
        mat_tag = i + 10
        k_n_m = stiffnesses_kn_m[i] * 1e3  # kN/m → N/m
        ops.uniaxialMaterial("Elastic", mat_tag, k_n_m)
        # zeroLength element connecting node i → node i+1 in X direction
        ops.element("zeroLength", i + 1, i, i + 1,
                     "-mat", mat_tag, "-dir", 1,
                     "-orient", 1, 0, 0, 0, 1, 0)

    # Eigenvalue analysis: compute n modes
    num_modes = min(n, 10)
    eigenvalues = ops.eigen(num_modes)

    omega = np.sqrt(np.abs(eigenvalues))         # rad/s
    T_modes = [2 * np.pi / w for w in omega]     # seconds

    # Extract mode shapes (eigenvectors at floor nodes, X-DOF = DOF 1)
    mode_shapes = []
    for mode in range(1, num_modes + 1):
        phi = []
        for node in range(1, n + 1):
            val = ops.nodeEigenvector(node, mode, 1)  # DOF=1 = X
            phi.append(val)
        mode_shapes.append(phi)

    # Modal participation factors & effective modal masses
    total_mass = sum(masses_kg)
    modal_masses = []
    participation_factors = []
    for mode_idx in range(num_modes):
        phi = np.array(mode_shapes[mode_idx])
        M = np.array(masses_kg)
        L_n = float(np.dot(M, phi))          # participation factor numerator
        M_n = float(np.dot(np.dot(phi, np.diag(M)), phi))  # generalized mass
        gamma_n = L_n / M_n                  # participation factor
        Meff_n = (L_n ** 2) / M_n           # effective modal mass
        participation_factors.append(gamma_n)
        modal_masses.append(float(Meff_n))

    ops.wipe()

    return {
        "natural_periods_s": [round(t, 4) for t in T_modes],
        "mode_shapes": [[round(v, 6) for v in phi] for phi in mode_shapes],
        "modal_participation_factors": [round(g, 4) for g in participation_factors],
        "modal_effective_masses_kg": [round(m, 2) for m in modal_masses],
        "total_mass_kg": round(total_mass, 2),
    }


# ─────────────────────────────────────────────
#  Seismic Force Distribution & Drift
# ─────────────────────────────────────────────

def compute_seismic_forces(stories: List[StoryData], spectrum: dict,
                            modal_results: dict, R: float, g: float = 9.81):
    """
    คำนวณแรงแผ่นดินไหว ด้วย Modal Response Spectrum (SRSS combination)
    ตามมาตรฐาน มยผ. 1302-52 ข้อ 3.4
    """
    n = len(stories)
    num_modes = len(modal_results["natural_periods_s"])
    T_modes = modal_results["natural_periods_s"]
    mode_shapes = modal_results["mode_shapes"]
    gamma_n = modal_results["modal_participation_factors"]
    Meff_n = modal_results["modal_effective_masses_kg"]
    masses_kg = [
        (s.dead_load_kn + 0.25 * s.live_load_kn) * 1000 / g  # kN → kg
        for s in stories
    ]

    # Spectral acceleration per mode (design level = MCE/1.5)
    Sa_modes = [get_sa(T, spectrum) for T in T_modes]

    # Modal base shear Vn = (Meff * Sa) / R
    # Note: Sa is in units of g, Meff in kg → V = Meff * g * Sa / R (N) → /1000 = kN
    modal_base_shears_kn = [
        (Meff_n[i] * g * Sa_modes[i]) / R / 1000.0
        for i in range(num_modes)
    ]

    # SRSS combination of base shear
    V_srss_kn = float(np.sqrt(sum(v**2 for v in modal_base_shears_kn)))

    # Minimum base shear check: Vmin = 0.044 * SDS * W (มยผ. 1302-52 ข้อ 3.4.2)
    W_total_kn = sum(
        s.dead_load_kn + 0.25 * s.live_load_kn for s in stories
    )
    V_min_kn = 0.044 * spectrum["SDS"] * W_total_kn
    V_design_kn = max(V_srss_kn, V_min_kn)

    # Lateral forces per floor (inverted triangle for simplified distribution)
    # F_x = V * (w_x * h_x) / Σ(w_i * h_i)
    heights_cumulative = []
    h = 0.0
    for s in stories:
        h += s.height_m
        heights_cumulative.append(h)

    weights_kn = [s.dead_load_kn + 0.25 * s.live_load_kn for s in stories]
    sum_wh = sum(weights_kn[i] * heights_cumulative[i] for i in range(n))
    floor_forces_kn = [
        V_design_kn * (weights_kn[i] * heights_cumulative[i]) / sum_wh
        for i in range(n)
    ]

    # Story shear (from top down)
    story_shears_kn = []
    cumulative = 0.0
    for f in reversed(floor_forces_kn):
        cumulative += f
        story_shears_kn.insert(0, round(cumulative, 2))

    # Story drift = V_story / k_story  (elastic analysis)
    story_drifts_mm = [
        (story_shears_kn[i] / stories[i].lateral_stiffness_kn_m) * 1000.0
        for i in range(n)
    ]

    # Drift ratio check
    drift_checks = []
    for i in range(n):
        ratio = (story_drifts_mm[i] / 1000.0) / stories[i].height_m
        drift_checks.append({
            "story": i + 1,
            "drift_mm": round(story_drifts_mm[i], 2),
            "drift_ratio": round(ratio, 5),
            "limit_ratio": DRIFT_LIMIT_RATIO,
            "passed": ratio <= DRIFT_LIMIT_RATIO,
        })

    return {
        "total_weight_kn": round(W_total_kn, 2),
        "modal_base_shears_kn": [round(v, 2) for v in modal_base_shears_kn],
        "base_shear_srss_kn": round(V_srss_kn, 2),
        "base_shear_minimum_kn": round(V_min_kn, 2),
        "base_shear_design_kn": round(V_design_kn, 2),
        "floor_forces_kn": [round(f, 2) for f in floor_forces_kn],
        "story_shears_kn": story_shears_kn,
        "story_drift_checks": drift_checks,
        "max_story_drift_mm": round(max(story_drifts_mm), 2),
        "all_drifts_passed": all(d["passed"] for d in drift_checks),
    }


# ─────────────────────────────────────────────
#  Cross-Check comparison
# ─────────────────────────────────────────────

TOLERANCE = 0.20  # ±20% tolerance for cross-check

def cross_check(label: str, opensees_val: float, engineer_val: Optional[float], higher_is_worse: bool = True):
    if engineer_val is None:
        return {"label": label, "status": "not_provided", "opensees": round(opensees_val, 3), "engineer": None, "deviation_pct": None}
    
    dev = (engineer_val - opensees_val) / opensees_val if opensees_val != 0 else 0
    
    # For base shear: engineer UNDERESTIMATING is dangerous (higher_is_worse=True means engineer > model is OK)
    # For drift: engineer UNDERESTIMATING is dangerous
    if higher_is_worse:
        # Unsafe if engineer value is significantly less than OpenSees (underestimation > 20%)
        passed = dev >= -TOLERANCE
    else:
        # Conservative if engineer is below OpenSees within tolerance
        passed = abs(dev) <= TOLERANCE

    verdict = "pass" if passed else "fail"
    if abs(dev) <= TOLERANCE / 2:
        verdict = "pass"  # within 10% is always safe

    return {
        "label": label,
        "status": verdict,
        "opensees": round(opensees_val, 3),
        "engineer": round(engineer_val, 3),
        "deviation_pct": round(dev * 100, 1),
        "passed": passed,
    }


# ─────────────────────────────────────────────
#  API Endpoints
# ─────────────────────────────────────────────

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "opensees-engine",
        "openseespy_available": OPENSEES_AVAILABLE,
    }


@app.post("/analyze-seismic")
async def analyze_seismic(data: SeismicCheckInput):
    """
    รัน Seismic Dynamic Analysis ด้วย OpenSeesPy
    และ Cross-check กับค่าที่วิศวกรส่งมา
    """
    if not OPENSEES_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="OpenSeesPy shared library failed to load on this platform. "
                   "Check container logs for the import error.",
        )
    try:
        g = 9.81
        n = len(data.stories)

        # ── 1. Build mass & stiffness arrays ──────────────────────────────
        masses_kg = [
            (s.dead_load_kn + 0.25 * s.live_load_kn) * 1e3 / g
            for s in data.stories
        ]
        stiffnesses = [s.lateral_stiffness_kn_m for s in data.stories]

        # ── 2. Design Spectrum ────────────────────────────────────────────
        spectrum = compute_design_spectrum(data.seismic_zone, data.site_class)
        R = R_FACTORS[data.structural_system]

        # ── 3. OpenSees Modal Analysis ───────────────────────────────────
        modal_results = run_opensees_modal_analysis(masses_kg, stiffnesses)
        T1 = modal_results["natural_periods_s"][0]

        # Empirical period check per มยผ. 1302-52 ข้อ 3.3.2
        # T_approx = 0.0466 * hn^0.9 (for concrete frame)
        hn = sum(s.height_m for s in data.stories)
        T_empirical = 0.0466 * (hn ** 0.9)
        # CuTa limit: Cu = 1.4 for SDS >= 0.4
        Cu = 1.4 if spectrum["SDS"] >= 0.4 else 1.7
        T_upper_limit = Cu * T_empirical

        # ── 4. Seismic Forces & Drift ─────────────────────────────────────
        force_results = compute_seismic_forces(data.stories, spectrum, modal_results, R, g)

        # ── 5. Cross-Check vs Engineer's Submission ───────────────────────
        cross_checks = [
            cross_check(
                "Base Shear (kN)",
                force_results["base_shear_design_kn"],
                data.engineer_base_shear_kn,
                higher_is_worse=True,   # engineer underestimating V is unsafe
            ),
            cross_check(
                "Max Story Drift (mm)",
                force_results["max_story_drift_mm"],
                data.engineer_max_story_drift_mm,
                higher_is_worse=True,  # underestimating drift is unsafe
            ),
            cross_check(
                "Fundamental Period T1 (s)",
                T1,
                data.engineer_fundamental_period_s,
                higher_is_worse=False,  # period mismatch (either direction) is a concern
            ),
        ]

        overall_pass = all(
            c["passed"] for c in cross_checks if c["status"] != "not_provided"
        ) and force_results["all_drifts_passed"]

        return JSONResponse(content={
            "project_name": data.project_name,
            "overall_status": "pass" if overall_pass else "fail",
            "input_summary": {
                "n_stories": n,
                "total_height_m": round(hn, 2),
                "seismic_zone": data.seismic_zone,
                "site_class": data.site_class,
                "structural_system": data.structural_system,
                "R_factor": R,
            },
            "design_spectrum": {
                "SDS_g": round(spectrum["SDS"], 4),
                "SD1_g": round(spectrum["SD1"], 4),
                "T0_s": round(spectrum["T0"], 4),
                "Ts_s": round(spectrum["Ts"], 4),
                "Fa": round(spectrum["Fa"], 3),
                "Fv": round(spectrum["Fv"], 3),
            },
            "modal_analysis": {
                "fundamental_period_T1_s": T1,
                "empirical_period_Ta_s": round(T_empirical, 4),
                "period_upper_limit_CuTa_s": round(T_upper_limit, 4),
                "period_within_limit": T1 <= T_upper_limit,
                "natural_periods_s": modal_results["natural_periods_s"],
                "modal_effective_masses_kg": modal_results["modal_effective_masses_kg"],
                "total_mass_kg": modal_results["total_mass_kg"],
                "modal_mass_participation_pct": [
                    round(m / modal_results["total_mass_kg"] * 100, 1)
                    for m in modal_results["modal_effective_masses_kg"]
                ],
            },
            "seismic_forces": force_results,
            "cross_check_results": cross_checks,
            "standard": "มยผ. 1302-52 (กรมโยธาธิการและผังเมือง)",
        })

    except Exception as e:
        tb = traceback.format_exc()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}\n{tb}")
