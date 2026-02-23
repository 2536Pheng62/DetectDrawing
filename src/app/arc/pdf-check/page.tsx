'use client';

import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Eye,
  FileText,
  Info,
  Loader2,
  Ruler,
  Scan,
  Upload,
  XCircle,
  Zap,
} from 'lucide-react';
import {
  BuildingType,
  BUILDING_TYPE_LABELS,
  CalibrationMethod,
  PdfAnalysisOptions,
  PdfAnalysisResult,
  RuleCheck,
  ScaleCalibrationResult,
  SYMBOL_CLASS_LABELS,
  buildFormData,
  calibrationConfidenceLabel,
  calibrationMethodLabel,
  formatScale,
  ruleStatusColor,
} from '@/lib/arc/pdf-analyzer';

// ─────────────────────────────────────────────────────────────────────────────
//  Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function Card({ title, icon: Icon, children, defaultOpen = true }: {
  title: string; icon: React.ElementType;
  children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Icon size={16} className="text-violet-500" />
          {title}
        </span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
}

function StatusBadge({ passed }: { passed: boolean }) {
  return passed ? (
    <span className="flex items-center gap-1 text-xs font-semibold text-green-700">
      <CheckCircle2 size={12} /> ผ่าน
    </span>
  ) : (
    <span className="flex items-center gap-1 text-xs font-semibold text-red-600">
      <XCircle size={12} /> ไม่ผ่าน
    </span>
  );
}

function CalibrationBadge({ calib }: { calib: ScaleCalibrationResult }) {
  const colors: Record<CalibrationMethod, string> = {
    dimension_lines: 'bg-green-100 text-green-700 border-green-200',
    title_block:     'bg-yellow-100 text-yellow-700 border-yellow-200',
    'fallback_1:100':'bg-red-100 text-red-600 border-red-200',
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${colors[calib.method]}`}>
      {calibrationMethodLabel(calib.method)}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Default options
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_OPTS: PdfAnalysisOptions = {
  pageNum: 0,
  dpi: 200,
  buildingType: 'detached_house',
  roadWidthM: 4.0,
  landAreaM2: undefined,
  occupantCount: 4,
  runRaster: true,
  runSymbols: true,
  runRules: true,
};

// ─────────────────────────────────────────────────────────────────────────────
//  Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function PdfCheckPage() {
  const [file, setFile]       = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [opts, setOpts]       = useState<PdfAnalysisOptions>(DEFAULT_OPTS);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<PdfAnalysisResult | null>(null);
  const [error, setError]     = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── drag-and-drop ─────────────────────────────────────────────────────────
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f?.name.toLowerCase().endsWith('.pdf')) {
      setFile(f); setResult(null); setError(null);
    } else {
      setError('กรุณาอัปโหลดเฉพาะไฟล์ .pdf');
    }
  }, []);

  // ── submit ────────────────────────────────────────────────────────────────
  const handleAnalyze = async () => {
    if (!file) { setError('กรุณาเลือกไฟล์ PDF ก่อน'); return; }
    setLoading(true); setError(null); setResult(null);
    try {
      const fd = buildFormData(file, opts);
      const res = await fetch('/api/pdf-analysis', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'เกิดข้อผิดพลาด');
      setResult(data as PdfAnalysisResult);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  //  Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/arc" className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors shrink-0">
          <ArrowLeft size={20} />
        </Link>
        <div className="bg-violet-100 p-2 rounded-lg">
          <FileText size={22} className="text-violet-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            วิเคราะห์แบบแปลน 2D (PDF)
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            PyMuPDF · OpenCV · Tesseract OCR · YOLO ·{' '}
            <span className="font-medium text-violet-700">Scale Calibration อัตโนมัติ</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── LEFT: Upload + Options ─────────────────────────────────────── */}
        <div className="lg:col-span-1 space-y-4">

          {/* Drop Zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              dragging
                ? 'border-violet-400 bg-violet-50'
                : file
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-200 bg-gray-50 hover:border-violet-300'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) { setFile(f); setResult(null); setError(null); }
              }}
            />
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <FileText size={32} className="text-green-500" />
                <p className="text-sm font-semibold text-gray-700 break-all">{file.name}</p>
                <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(0)} KB</p>
                <button
                  onClick={e => { e.stopPropagation(); setFile(null); setResult(null); }}
                  className="text-xs text-red-400 hover:text-red-600"
                >
                  เลือกไฟล์ใหม่
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <Upload size={32} />
                <p className="text-sm">ลากวาง หรือคลิกเลือกไฟล์ PDF</p>
                <p className="text-xs">รองรับ PDF จาก AutoCAD, SketchUp หรือสแกน</p>
              </div>
            )}
          </div>

          {/* Analysis Options */}
          <div className="border border-gray-200 rounded-xl p-4 bg-white space-y-3">
            <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Info size={15} className="text-violet-500" /> ตัวเลือกการวิเคราะห์
            </h2>

            {/* Building type */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">ประเภทอาคาร</label>
              <select
                value={opts.buildingType}
                title="ประเภทอาคาร"
                aria-label="ประเภทอาคาร"
                onChange={e => setOpts(p => ({ ...p, buildingType: e.target.value as BuildingType }))}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
              >
                {(Object.entries(BUILDING_TYPE_LABELS) as [BuildingType, string][]).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>

            {/* Number inputs row */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'หน้า PDF (0-based)', key: 'pageNum', step: 1, min: 0 },
                { label: 'DPI', key: 'dpi', step: 50, min: 72 },
                { label: 'ความกว้างถนน (m)', key: 'roadWidthM', step: 0.5, min: 0 },
                { label: 'จำนวนผู้พักอาศัย', key: 'occupantCount', step: 1, min: 1 },
                { label: 'พื้นที่ที่ดิน (m²)', key: 'landAreaM2', step: 10, min: 0 },
              ].map(({ label, key, step, min }) => (
                <div key={key} className="col-span-1">
                  <label className="block text-xs text-gray-500 mb-0.5">{label}</label>
                  <input
                    type="number"
                    value={(opts as Record<string, unknown>)[key] as string ?? ''}
                    step={step}
                    min={min}
                    onChange={e => setOpts(p => ({
                      ...p,
                      [key]: e.target.value ? parseFloat(e.target.value) : undefined,
                    }))}
                    className="w-full text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-violet-300"
                  />
                </div>
              ))}
            </div>

            {/* Toggle options */}
            <div className="space-y-1.5 pt-1">
              {[
                { key: 'runRaster',  label: 'Room Segmentation (OpenCV)' },
                { key: 'runSymbols', label: 'Symbol Detection (YOLO)' },
                { key: 'runRules',   label: 'Rule Checking (กฎกระทรวง)' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(opts as Record<string, unknown>)[key] as boolean ?? true}
                    onChange={e => setOpts(p => ({ ...p, [key]: e.target.checked }))}
                    className="rounded border-gray-300 text-violet-600 focus:ring-violet-400"
                  />
                  <span className="text-xs text-gray-600">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleAnalyze}
            disabled={loading || !file}
            className="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow"
          >
            {loading ? (
              <><Loader2 size={16} className="animate-spin" /> กำลังวิเคราะห์…</>
            ) : (
              <><Scan size={16} /> วิเคราะห์แบบแปลน PDF</>
            )}
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex gap-2">
              <XCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 whitespace-pre-wrap">{error}</p>
            </div>
          )}
        </div>

        {/* ── RIGHT: Results ─────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          {result ? (
            <AnalysisResults result={result} />
          ) : !loading ? (
            <div className="h-64 flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-100 rounded-xl">
              <FileText size={40} />
              <p className="mt-2 text-sm">อัปโหลด PDF และกดวิเคราะห์เพื่อดูผล</p>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-violet-400 border-2 border-dashed border-violet-100 rounded-xl">
              <Loader2 size={36} className="animate-spin" />
              <p className="mt-3 text-sm font-medium">กำลังรัน Pipeline…</p>
              <p className="text-xs text-gray-400 mt-1">PyMuPDF → Scale Calibration → OpenCV → OCR → YOLO</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Results Component
// ─────────────────────────────────────────────────────────────────────────────

function AnalysisResults({ result }: { result: PdfAnalysisResult }) {
  const rule = result.rule_check;
  const calib = result.scale_calibration;

  return (
    <div className="space-y-4">
      {/* Overall banner */}
      {rule && (
        <div className={`rounded-xl p-4 flex items-center gap-3 border ${
          rule.overall_passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}>
          {rule.overall_passed
            ? <CheckCircle2 size={24} className="text-green-600 flex-shrink-0" />
            : <XCircle size={24} className="text-red-600 flex-shrink-0" />
          }
          <div>
            <p className={`font-bold text-sm ${rule.overall_passed ? 'text-green-800' : 'text-red-800'}`}>
              {rule.overall_passed ? 'ผลการตรวจสอบ: ผ่าน' : 'ผลการตรวจสอบ: ไม่ผ่าน'}
            </p>
            <p className="text-xs text-gray-500">
              ผ่าน {rule.passed_count} / {rule.passed_count + rule.failed_count} รายการ
              {rule.warnings.length > 0 && ` · ${rule.warnings.length} คำเตือน`}
            </p>
          </div>
        </div>
      )}

      {/* File info + Scale Calibration */}
      <Card title="ไฟล์ & Scale Calibration" icon={Ruler}>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <InfoRow label="ไฟล์" value={result.file_name} />
          <InfoRow label="หน้าที่วิเคราะห์" value={`${result.analyzed_page + 1} / ${result.total_pages}`} />
          <InfoRow label="ขนาดหน้า (pts)" value={`${result.page_size_pts.width} × ${result.page_size_pts.height}`} />
          <InfoRow label="ขนาดหน้า (m)" value={`${result.page_size_m.width} × ${result.page_size_m.height}`} />
          <InfoRow label="PDF ประเภท" value={result.is_raster_page ? 'Raster (สแกน)' : 'Vector (CAD)'} />
        </div>
        <div className="mt-3 bg-violet-50 border border-violet-100 rounded-lg p-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-violet-700">Scale Calibration</span>
            <CalibrationBadge calib={calib} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Stat label="มาตราส่วน" value={formatScale(calib.drawing_scale_ratio)} />
            <Stat label="Pts/Meter" value={calib.pts_per_meter.toFixed(2)} />
            <Stat label="ความน่าเชื่อถือ" value={calibrationConfidenceLabel(calib)} />
          </div>
          {calib.pairs_found > 0 && (
            <p className="text-[10px] text-violet-500">
              พบ {calib.pairs_found} คู่ dimension line/text · ใช้ {calib.pairs_used} คู่
            </p>
          )}
          {calib.warnings.map((w, i) => (
            <p key={i} className="text-[10px] text-amber-600 flex items-center gap-1">
              <AlertTriangle size={10} /> {w}
            </p>
          ))}
        </div>
      </Card>

      {/* Setbacks */}
      {result.estimated_setbacks_m && (
        <Card title="ระยะร่นโดยประมาณ (จาก Vector Lines)" icon={Eye}>
          <div className="grid grid-cols-3 gap-3 mb-2">
            <Stat label="หน้า" value={result.estimated_setbacks_m.front != null ? `${result.estimated_setbacks_m.front} m` : '–'} />
            <Stat label="ข้าง" value={result.estimated_setbacks_m.side != null ? `${result.estimated_setbacks_m.side} m` : '–'} />
            <Stat label="หลัง" value={result.estimated_setbacks_m.rear != null ? `${result.estimated_setbacks_m.rear} m` : '–'} />
          </div>
          <p className="text-[10px] text-gray-400">{result.estimated_setbacks_m.note}</p>
        </Card>
      )}

      {/* Raster analysis */}
      {result.raster_analysis && (
        <Card title={`Room Segmentation (OpenCV) – พบ ${result.raster_analysis.rooms_found} ห้อง`} icon={Scan} defaultOpen={false}>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <Stat label="เส้นผนังพบ" value={String(result.raster_analysis.wall_lines_found)} />
            <Stat label="ข้อความ OCR" value={String(result.raster_analysis.ocr_text_count)} />
            {result.raster_analysis.scale_hint_from_ocr && (
              <Stat label="Scale (OCR)" value={result.raster_analysis.scale_hint_from_ocr} />
            )}
          </div>
          {result.raster_analysis.rooms.length > 0 && (
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-400 border-b border-gray-100 text-left">
                  <th className="pb-1">ห้อง</th>
                  <th className="pb-1 px-2">พื้นที่ (m²)</th>
                </tr>
              </thead>
              <tbody>
                {result.raster_analysis.rooms.map((r, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-1 text-gray-600">#{i + 1}</td>
                    <td className="py-1 px-2 font-mono">{r.area_m2 ?? '–'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {result.raster_analysis.warnings.map((w, i) => (
            <p key={i} className="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
              <AlertTriangle size={10} /> {w}
            </p>
          ))}
        </Card>
      )}

      {/* Symbol detection */}
      {result.symbol_detection && (
        <Card title={`Symbol Detection (${result.symbol_detection.model_used.toUpperCase()}) – ${result.symbol_detection.total_symbols} สัญลักษณ์`} icon={Zap} defaultOpen={false}>
          {result.symbol_detection.model_used === 'stub' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 mb-3">
              <p className="text-xs text-amber-700 flex items-center gap-1">
                <AlertTriangle size={12} />
                <strong>Stub Mode:</strong> ยังไม่มีโมเดล YOLO – ผลลัพธ์ไม่แม่นยำ
              </p>
            </div>
          )}
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(result.symbol_detection.counts_per_class).map(([cls, cnt]) => (
              <div key={cls} className="bg-gray-50 rounded-lg p-2 text-center">
                <p className="text-xs text-gray-400">{SYMBOL_CLASS_LABELS[cls] ?? cls}</p>
                <p className="text-lg font-bold text-gray-700">{cnt as number}</p>
              </div>
            ))}
          </div>
          {result.symbol_detection.warnings.map((w, i) => (
            <p key={i} className="text-[10px] text-amber-600 mt-2 flex items-center gap-1">
              <AlertTriangle size={10} /> {w}
            </p>
          ))}
        </Card>
      )}

      {/* Rule checking */}
      {result.rule_check && (
        <Card title={`ตรวจสอบกฎหมาย – ${result.rule_check.passed_count} ผ่าน / ${result.rule_check.failed_count} ไม่ผ่าน`} icon={CheckCircle2}>
          <div className="space-y-2">
            {result.rule_check.checks.map((c: RuleCheck) => (
              <div key={c.rule_id} className={`rounded-lg p-3 border ${ruleStatusColor(c.passed)}`}>
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{c.rule_name_th}</p>
                    <p className="text-[10px] opacity-75 mt-0.5">{c.detail}</p>
                    <p className="text-[10px] opacity-50 mt-0.5 italic">{c.legal_reference}</p>
                  </div>
                  <StatusBadge passed={c.passed} />
                </div>
              </div>
            ))}
            {result.rule_check.warnings.map((w, i) => (
              <p key={i} className="text-xs text-amber-600 flex items-center gap-1">
                <AlertTriangle size={12} /> {w}
              </p>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Tiny reusables
// ─────────────────────────────────────────────────────────────────────────────

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-2 text-center">
      <p className="text-[10px] text-gray-400">{label}</p>
      <p className="text-sm font-bold text-gray-700 truncate">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-gray-400">{label}: </span>
      <span className="font-medium text-gray-700">{value}</span>
    </div>
  );
}
