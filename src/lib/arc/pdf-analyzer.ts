/**
 * pdf-analyzer.ts
 * ──────────────────────────────────────────────────────────────────────
 * TypeScript types + helpers สำหรับโมดูล PDF floor-plan analysis
 */

// ─────────────────────────────────────────────────────────────────────────────
//  Enums / Literals
// ─────────────────────────────────────────────────────────────────────────────

export type BuildingType =
  | 'detached_house'
  | 'townhouse'
  | 'apartment'
  | 'commercial'
  | 'factory';

export type CalibrationMethod =
  | 'dimension_lines'
  | 'title_block'
  | 'fallback_1:100';

export const BUILDING_TYPE_LABELS: Record<BuildingType, string> = {
  detached_house: 'บ้านเดี่ยว',
  townhouse: 'บ้านแถว / ทาวน์เฮ้าส์',
  apartment: 'อาคารชุด (คอนโดมิเนียม)',
  commercial: 'อาคารพาณิชย์',
  factory: 'โรงงานอุตสาหกรรม',
};

// ─────────────────────────────────────────────────────────────────────────────
//  Scale Calibration result
// ─────────────────────────────────────────────────────────────────────────────

export interface ScaleCalibrationResult {
  pts_per_meter: number;
  method: CalibrationMethod;
  drawing_scale_ratio: number;   // e.g. 100 for 1:100
  confidence: number;            // 0-1
  pairs_found: number;
  pairs_used: number;
  warnings: string[];
}

/** Human-readable confidence label */
export function calibrationConfidenceLabel(c: ScaleCalibrationResult): string {
  if (c.method === 'dimension_lines' && c.confidence >= 0.7) return 'สูง';
  if (c.method === 'title_block') return 'ปานกลาง';
  return 'ต่ำ (fallback)';
}

export function calibrationMethodLabel(m: CalibrationMethod): string {
  switch (m) {
    case 'dimension_lines': return 'Dimension Lines (แม่นยำสูง)';
    case 'title_block':     return 'Title Block Scale Text';
    case 'fallback_1:100':  return 'ค่าเริ่มต้น 1:100 (ไม่แม่นยำ)';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Raster analysis
// ─────────────────────────────────────────────────────────────────────────────

export interface RoomResult {
  area_m2: number | null;
  bbox_px: [number, number, number, number];
}

export interface RasterAnalysis {
  dpi: number;
  wall_lines_found: number;
  rooms_found: number;
  rooms: RoomResult[];
  ocr_text_count: number;
  scale_hint_from_ocr: string | null;
  warnings: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
//  Symbol detection
// ─────────────────────────────────────────────────────────────────────────────

export interface SymbolDetection {
  class_name: string;
  confidence: number;
  bbox_px: [number, number, number, number];
}

export interface SymbolDetectionResult {
  model_used: 'yolo' | 'stub';
  model_path: string;
  total_symbols: number;
  counts_per_class: Record<string, number>;
  warnings: string[];
  detections: SymbolDetection[];
}

export const SYMBOL_CLASS_LABELS: Record<string, string> = {
  toilet:     'โถส้วม / ส้วมนั่งราบ',
  urinal:     'โถปัสสาวะ',
  door:       'ประตู',
  door_swing: 'รัศมีการเปิดประตู',
  window:     'หน้าต่าง',
  stair:      'บันได',
  column:     'เสา',
  elevator:   'ลิฟต์',
  fire_exit:  'ประตูหนีไฟ',
  sink:       'อ่างล้างหน้า / ซิงก์',
};

// ─────────────────────────────────────────────────────────────────────────────
//  Rule checking
// ─────────────────────────────────────────────────────────────────────────────

export interface RuleCheck {
  rule_id: string;
  rule_name_th: string;
  passed: boolean;
  value: number | null;
  required: number | null;
  unit: string;
  detail: string;
  legal_reference: string;
}

export interface RuleCheckReport {
  overall_passed: boolean;
  passed_count: number;
  failed_count: number;
  warnings: string[];
  checks: RuleCheck[];
}

// ─────────────────────────────────────────────────────────────────────────────
//  Full PDF analysis result
// ─────────────────────────────────────────────────────────────────────────────

export interface PdfAnalysisResult {
  file_name: string;
  total_pages: number;
  analyzed_page: number;
  page_size_pts: { width: number; height: number };
  page_size_m: { width: number; height: number };
  is_raster_page: boolean;
  scale_calibration: ScaleCalibrationResult;
  estimated_setbacks_m?: {
    front: number | null;
    side: number | null;
    rear: number | null;
    note: string;
  };
  raster_analysis?: RasterAnalysis;
  symbol_detection?: SymbolDetectionResult;
  rule_check?: RuleCheckReport;
}

// ─────────────────────────────────────────────────────────────────────────────
//  FormData builder for API call
// ─────────────────────────────────────────────────────────────────────────────

export interface PdfAnalysisOptions {
  pageNum?: number;
  dpi?: number;
  buildingType?: BuildingType;
  roadWidthM?: number;
  landAreaM2?: number;
  occupantCount?: number;
  runRaster?: boolean;
  runSymbols?: boolean;
  runRules?: boolean;
}

export function buildFormData(file: File, opts: PdfAnalysisOptions): FormData {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('page_num', String(opts.pageNum ?? 0));
  fd.append('dpi', String(opts.dpi ?? 200));
  fd.append('building_type', opts.buildingType ?? 'detached_house');
  fd.append('road_width_m', String(opts.roadWidthM ?? 4.0));
  if (opts.landAreaM2) fd.append('land_area_m2', String(opts.landAreaM2));
  fd.append('occupant_count', String(opts.occupantCount ?? 4));
  fd.append('run_raster', opts.runRaster !== false ? 'true' : 'false');
  fd.append('run_symbols', opts.runSymbols !== false ? 'true' : 'false');
  fd.append('run_rules', opts.runRules !== false ? 'true' : 'false');
  return fd;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Display helpers
// ─────────────────────────────────────────────────────────────────────────────

export function ruleStatusColor(passed: boolean): string {
  return passed
    ? 'text-green-700 bg-green-50 border-green-200'
    : 'text-red-700 bg-red-50 border-red-200';
}

export function formatScale(ratio: number): string {
  const r = Math.round(ratio);
  return `1:${r}`;
}
