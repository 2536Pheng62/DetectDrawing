/**
 * seismic-engine.ts
 * ──────────────────────────────────────────────────────────────────────
 * TypeScript types & helper utilities สำหรับโมดูล Seismic Cross-Check
 * (OpenSeesPy / มยผ. 1302-52)
 */

// ─────────────────────────────────────────────
//  Input Types
// ─────────────────────────────────────────────

export type SeismicZone = 1 | 2 | 3;
export type SiteClass = 'A' | 'B' | 'C' | 'D' | 'E';
export type StructuralSystem = 'OMRF' | 'IMRF' | 'SMRF';

export interface StoryData {
  height_m: number;
  dead_load_kn: number;
  live_load_kn: number;
  lateral_stiffness_kn_m: number;
}

export interface SeismicCheckInput {
  project_name: string;
  seismic_zone: SeismicZone;
  site_class: SiteClass;
  structural_system: StructuralSystem;
  stories: StoryData[];
  // Optional – engineer's submitted values for cross-check
  engineer_base_shear_kn?: number;
  engineer_max_story_drift_mm?: number;
  engineer_fundamental_period_s?: number;
}

// ─────────────────────────────────────────────
//  Output Types (matches OpenSees engine response)
// ─────────────────────────────────────────────

export interface CrossCheckItem {
  label: string;
  status: 'pass' | 'fail' | 'not_provided';
  opensees: number;
  engineer: number | null;
  deviation_pct: number | null;
  passed: boolean;
}

export interface DriftCheck {
  story: number;
  drift_mm: number;
  drift_ratio: number;
  limit_ratio: number;
  passed: boolean;
}

export interface SeismicAnalysisResult {
  project_name: string;
  overall_status: 'pass' | 'fail';
  input_summary: {
    n_stories: number;
    total_height_m: number;
    seismic_zone: number;
    site_class: string;
    structural_system: string;
    R_factor: number;
  };
  design_spectrum: {
    SDS_g: number;
    SD1_g: number;
    T0_s: number;
    Ts_s: number;
    Fa: number;
    Fv: number;
  };
  modal_analysis: {
    fundamental_period_T1_s: number;
    empirical_period_Ta_s: number;
    period_upper_limit_CuTa_s: number;
    period_within_limit: boolean;
    natural_periods_s: number[];
    modal_effective_masses_kg: number[];
    total_mass_kg: number;
    modal_mass_participation_pct: number[];
  };
  seismic_forces: {
    total_weight_kn: number;
    modal_base_shears_kn: number[];
    base_shear_srss_kn: number;
    base_shear_minimum_kn: number;
    base_shear_design_kn: number;
    floor_forces_kn: number[];
    story_shears_kn: number[];
    story_drift_checks: DriftCheck[];
    max_story_drift_mm: number;
    all_drifts_passed: boolean;
  };
  cross_check_results: CrossCheckItem[];
  standard: string;
}

// ─────────────────────────────────────────────
//  Seismic Zone Descriptions (มยผ. 1302-52)
// ─────────────────────────────────────────────

export const SEISMIC_ZONE_LABELS: Record<SeismicZone, string> = {
  1: 'โซน 1 – กรุงเทพฯ และส่วนใหญ่ของประเทศ (PGA ≈ 0.04g)',
  2: 'โซน 2 – ภาคเหนือ: เชียงใหม่ ลำปาง แม่ฮ่องสอน (PGA ≈ 0.08g)',
  3: 'โซน 3 – ชายแดนภาคเหนือ: เชียงราย อ.พญาเม็งราย (PGA ≈ 0.16g)',
};

export const SITE_CLASS_LABELS: Record<SiteClass, string> = {
  A: 'A – หินแข็ง (Hard Rock, Vs > 1500 m/s)',
  B: 'B – หินแข็งปานกลาง (Rock, 760–1500 m/s)',
  C: 'C – ดินแข็งหรือหินอ่อน (Very Dense Soil, 360–760 m/s)',
  D: 'D – ดินแข็ง (Stiff Soil, 180–360 m/s)',
  E: 'E – ดินอ่อน (Soft Soil, Vs < 180 m/s) – กรุงเทพฯ/ที่ราบลุ่ม',
};

export const STRUCTURAL_SYSTEM_LABELS: Record<StructuralSystem, string> = {
  OMRF: 'OMRF – โครงต้านแรงดัดสามัญ (R = 3.0) – มยผ. ขั้นต่ำ',
  IMRF: 'IMRF – โครงต้านแรงดัดปานกลาง (R = 5.0)',
  SMRF: 'SMRF – โครงต้านแรงดัดพิเศษ (R = 8.0) – ต้องผ่านการอบรม วสท.',
};

// ─────────────────────────────────────────────
//  Validation helpers (client-side)
// ─────────────────────────────────────────────

export function validateSeismicInput(input: SeismicCheckInput): string[] {
  const errors: string[] = [];
  if (input.stories.length === 0) {
    errors.push('ต้องมีข้อมูลอย่างน้อย 1 ชั้น');
  }
  input.stories.forEach((s, i) => {
    if (s.height_m <= 0) errors.push(`ชั้นที่ ${i + 1}: ความสูงต้องมากกว่า 0`);
    if (s.dead_load_kn < 0) errors.push(`ชั้นที่ ${i + 1}: DL ต้องไม่ติดลบ`);
    if (s.live_load_kn < 0) errors.push(`ชั้นที่ ${i + 1}: LL ต้องไม่ติดลบ`);
    if (s.lateral_stiffness_kn_m <= 0)
      errors.push(`ชั้นที่ ${i + 1}: Lateral Stiffness ต้องมากกว่า 0`);
  });
  return errors;
}

/** Default story data สำหรับ 3-story RC frame ทั่วไป */
export function getDefaultStories(nStories = 3): StoryData[] {
  return Array.from({ length: nStories }, (_, i) => ({
    height_m: 3.5,
    dead_load_kn: 1200,         // ~12 kPa × 100 m² floor area
    live_load_kn: 250,           // ~2.5 kPa × 100 m²
    lateral_stiffness_kn_m: 50000 - i * 5000,  // สูงขึ้น → แข็งแรงน้อยลง
  }));
}

/** ฟอร์แมตค่า deviation ให้อ่านง่าย */
export function formatDeviation(pct: number | null): string {
  if (pct === null) return '–';
  const sign = pct > 0 ? '+' : '';
  return `${sign}${pct.toFixed(1)}%`;
}

/** สีสถานะ cross-check */
export function getStatusColor(status: CrossCheckItem['status']): string {
  switch (status) {
    case 'pass': return 'text-green-700 bg-green-50 border-green-200';
    case 'fail': return 'text-red-700 bg-red-50 border-red-200';
    default: return 'text-gray-500 bg-gray-50 border-gray-200';
  }
}
