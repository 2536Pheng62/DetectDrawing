'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Info,
  Loader2,
  Plus,
  Trash2,
  XCircle,
} from 'lucide-react';
import {
  CrossCheckItem,
  DriftCheck,
  SeismicAnalysisResult,
  SeismicCheckInput,
  SeismicZone,
  SiteClass,
  StructuralSystem,
  SEISMIC_ZONE_LABELS,
  SITE_CLASS_LABELS,
  STRUCTURAL_SYSTEM_LABELS,
  formatDeviation,
  getDefaultStories,
  getStatusColor,
  validateSeismicInput,
} from '@/lib/arc/seismic-engine';

// ─────────────────────────────────────────────────────────────────────────────
//  Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function SectionCard({ title, icon: Icon, children }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm">
      <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Icon size={18} className="text-indigo-500" />
        {title}
      </h2>
      {children}
    </div>
  );
}

function LabeledSelect<T extends string>({ label, value, onChange, options }: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <select
        value={value}
        title={label}
        aria-label={label}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function LabeledInput({ label, value, onChange, placeholder, unit }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  unit?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}{unit && <span className="text-gray-400 ml-1">({unit})</span>}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
      />
    </div>
  );
}

function StatusBadge({ status }: { status: 'pass' | 'fail' | 'not_provided' }) {
  if (status === 'not_provided')
    return <span className="text-xs text-gray-400">–</span>;
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${getStatusColor(status)}`}>
      {status === 'pass' ? 'ผ่าน' : 'ไม่ผ่าน'}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Default form state
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_INPUT: SeismicCheckInput = {
  project_name: '',
  seismic_zone: 1,
  site_class: 'D',
  structural_system: 'OMRF',
  stories: getDefaultStories(3),
  engineer_base_shear_kn: undefined,
  engineer_max_story_drift_mm: undefined,
  engineer_fundamental_period_s: undefined,
};

// ─────────────────────────────────────────────────────────────────────────────
//  Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function SeismicCheckPage() {
  const [form, setForm] = useState<SeismicCheckInput>(DEFAULT_INPUT);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SeismicAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSpectrum, setShowSpectrum] = useState(false);

  // ── story helpers ──────────────────────────────────────────────────────────
  const updateStory = useCallback(
    (idx: number, field: keyof typeof form.stories[0], val: string) => {
      setForm((prev) => {
        const stories = prev.stories.map((s, i) =>
          i === idx ? { ...s, [field]: parseFloat(val) || 0 } : s,
        );
        return { ...prev, stories };
      });
    },
    [],
  );

  const addStory = () =>
    setForm((prev) => ({
      ...prev,
      stories: [
        ...prev.stories,
        { height_m: 3.5, dead_load_kn: 1200, live_load_kn: 250, lateral_stiffness_kn_m: 40000 },
      ],
    }));

  const removeStory = (idx: number) =>
    setForm((prev) => ({
      ...prev,
      stories: prev.stories.filter((_, i) => i !== idx),
    }));

  // ── submit ─────────────────────────────────────────────────────────────────
  const handleAnalyze = async () => {
    const errors = validateSeismicInput(form);
    if (errors.length > 0) {
      setError(errors.join('\n'));
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/seismic-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          engineer_base_shear_kn: form.engineer_base_shear_kn || undefined,
          engineer_max_story_drift_mm: form.engineer_max_story_drift_mm || undefined,
          engineer_fundamental_period_s: form.engineer_fundamental_period_s || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'เกิดข้อผิดพลาด');
      setResult(data as SeismicAnalysisResult);
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
        <div className="bg-indigo-100 p-2 rounded-lg">
          <Activity size={22} className="text-indigo-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Seismic Cross-Check (OpenSees)
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            จำลองพฤติกรรมพลศาสตร์อาคารด้วย OpenSeesPy · ตรวจสอบตามมาตรฐาน{' '}
            <span className="font-medium text-indigo-700">มยผ. 1302-52</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── LEFT PANEL: Input form ─────────────────────────────────────── */}
        <div className="lg:col-span-1 space-y-4">
          {/* Project & zone info */}
          <SectionCard title="ข้อมูลโครงการ" icon={Info}>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">ชื่อโครงการ</label>
                <input
                  type="text"
                  value={form.project_name}
                  onChange={(e) => setForm((p) => ({ ...p, project_name: e.target.value }))}
                  placeholder="เช่น อาคาร A โครงการ XYZ"
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <LabeledSelect
                label="โซนแผ่นดินไหว (มยผ. 1302-52)"
                value={form.seismic_zone.toString() as '1' | '2' | '3'}
                onChange={(v) => setForm((p) => ({ ...p, seismic_zone: parseInt(v) as SeismicZone }))}
                options={([1, 2, 3] as SeismicZone[]).map((z) => ({
                  value: z.toString() as '1' | '2' | '3',
                  label: SEISMIC_ZONE_LABELS[z],
                }))}
              />
              <LabeledSelect
                label="ประเภทชั้นดิน (Site Class)"
                value={form.site_class}
                onChange={(v) => setForm((p) => ({ ...p, site_class: v as SiteClass }))}
                options={(['A', 'B', 'C', 'D', 'E'] as SiteClass[]).map((sc) => ({
                  value: sc,
                  label: SITE_CLASS_LABELS[sc],
                }))}
              />
              <LabeledSelect
                label="ระบบโครงสร้าง"
                value={form.structural_system}
                onChange={(v) => setForm((p) => ({ ...p, structural_system: v as StructuralSystem }))}
                options={(['OMRF', 'IMRF', 'SMRF'] as StructuralSystem[]).map((sys) => ({
                  value: sys,
                  label: STRUCTURAL_SYSTEM_LABELS[sys],
                }))}
              />
            </div>
          </SectionCard>

          {/* Engineer's submitted values */}
          <SectionCard title="ค่าที่วิศวกรส่ง (Optional)" icon={AlertTriangle}>
            <p className="text-xs text-gray-500 mb-3">
              กรอกเพื่อ Cross-check – หากไม่กรอก ระบบจะคำนวณค่าจาก OpenSees เพียงอย่างเดียว
            </p>
            <div className="space-y-3">
              <LabeledInput
                label="Base Shear (V)"
                unit="kN"
                value={form.engineer_base_shear_kn?.toString() ?? ''}
                onChange={(v) => setForm((p) => ({ ...p, engineer_base_shear_kn: v ? parseFloat(v) : undefined }))}
                placeholder="เช่น 850"
              />
              <LabeledInput
                label="Story Drift สูงสุด"
                unit="mm"
                value={form.engineer_max_story_drift_mm?.toString() ?? ''}
                onChange={(v) => setForm((p) => ({ ...p, engineer_max_story_drift_mm: v ? parseFloat(v) : undefined }))}
                placeholder="เช่น 42"
              />
              <LabeledInput
                label="คาบธรรมชาติ T₁"
                unit="s"
                value={form.engineer_fundamental_period_s?.toString() ?? ''}
                onChange={(v) => setForm((p) => ({ ...p, engineer_fundamental_period_s: v ? parseFloat(v) : undefined }))}
                placeholder="เช่น 0.52"
              />
            </div>
          </SectionCard>
        </div>

        {/* ── CENTER/RIGHT PANEL: Stories + Results ───────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Story table */}
          <SectionCard title={`ข้อมูลแต่ละชั้น (${form.stories.length} ชั้น)`} icon={Activity}>
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100">
                    <th className="pb-2 pl-1 font-medium">ชั้น</th>
                    <th className="pb-2 px-1 font-medium">h (m)</th>
                    <th className="pb-2 px-1 font-medium">DL (kN)</th>
                    <th className="pb-2 px-1 font-medium">LL (kN)</th>
                    <th className="pb-2 px-1 font-medium">k (kN/m)</th>
                    <th className="pb-2 pr-1" />
                  </tr>
                </thead>
                <tbody>
                  {form.stories.map((story, idx) => (
                    <tr key={idx} className="border-b border-gray-50">
                      <td className="py-1 pl-1 font-semibold text-gray-600">{idx + 1}</td>
                      {(
                        [
                          ['height_m', '3.5'],
                          ['dead_load_kn', '1200'],
                          ['live_load_kn', '250'],
                          ['lateral_stiffness_kn_m', '50000'],
                        ] as [keyof typeof story, string][]
                      ).map(([field, placeholder]) => (
                        <td key={field} className="py-1 px-1">
                          <input
                            type="number"
                            value={(story[field] as number) || ''}
                            onChange={(e) => updateStory(idx, field, e.target.value)}
                            placeholder={placeholder}
                            className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-300"
                          />
                        </td>
                      ))}
                      <td className="py-1 pr-1">
                        <button
                          onClick={() => removeStory(idx)}
                          disabled={form.stories.length <= 1}
                          aria-label={`ลบชั้นที่ ${idx + 1}`}
                          title={`ลบชั้นที่ ${idx + 1}`}
                          className="text-gray-300 hover:text-red-400 disabled:cursor-not-allowed transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={addStory}
              className="mt-3 flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
            >
              <Plus size={14} /> เพิ่มชั้น
            </button>

            <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700">
              <strong>Lateral Stiffness (k)</strong> = ความแข็งแรงด้านข้างของชั้น ≈{' '}
              <em>12EI/h³ × จำนวนเสา</em> ตัวอย่าง: เสา RC 0.5×0.5 m, h=3.5m, E=24000 MPa → k ≈ 50,000 kN/m ต่อชั้น
            </div>
          </SectionCard>

          {/* Analyze button */}
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                กำลังรัน OpenSees Modal Analysis…
              </>
            ) : (
              <>
                <Activity size={16} />
                วิเคราะห์แผ่นดินไหว (OpenSees)
              </>
            )}
          </button>

          {/* Error display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
              <XCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
              <pre className="text-sm text-red-700 whitespace-pre-wrap font-sans">{error}</pre>
            </div>
          )}

          {/* ── Results ──────────────────────────────────────────────────── */}
          {result && <AnalysisResults result={result} showSpectrum={showSpectrum} onToggleSpectrum={() => setShowSpectrum((p) => !p)} />}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Results Component
// ─────────────────────────────────────────────────────────────────────────────

function AnalysisResults({
  result,
  showSpectrum,
  onToggleSpectrum,
}: {
  result: SeismicAnalysisResult;
  showSpectrum: boolean;
  onToggleSpectrum: () => void;
}) {
  const passed = result.overall_status === 'pass';

  return (
    <div className="space-y-4">
      {/* Overall verdict banner */}
      <div
        className={`rounded-xl p-4 flex items-center gap-3 border ${
          passed
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}
      >
        {passed ? (
          <CheckCircle2 size={24} className="text-green-600 flex-shrink-0" />
        ) : (
          <XCircle size={24} className="text-red-600 flex-shrink-0" />
        )}
        <div>
          <p className={`font-bold text-sm ${passed ? 'text-green-800' : 'text-red-800'}`}>
            {passed ? 'ผลการ Cross-check: ผ่าน' : 'ผลการ Cross-check: ไม่ผ่าน'}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {result.standard} · โครงสร้าง {result.input_summary.structural_system} ·{' '}
            โซน {result.input_summary.seismic_zone} · ชั้นดิน {result.input_summary.site_class} ·{' '}
            R = {result.input_summary.R_factor}
          </p>
        </div>
      </div>

      {/* Design Spectrum summary (collapsible) */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <button
          onClick={onToggleSpectrum}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <span>Design Spectrum (มยผ. 1302-52)</span>
          {showSpectrum ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {showSpectrum && (
          <div className="p-4 bg-white grid grid-cols-3 gap-3">
            {[
              { label: 'SDS', value: `${result.design_spectrum.SDS_g.toFixed(3)} g`, note: 'Short period' },
              { label: 'SD1', value: `${result.design_spectrum.SD1_g.toFixed(3)} g`, note: '1-second' },
              { label: 'T₀', value: `${result.design_spectrum.T0_s.toFixed(3)} s`, note: 'ต้น plateau' },
              { label: 'Ts', value: `${result.design_spectrum.Ts_s.toFixed(3)} s`, note: 'สิ้นสุด plateau' },
              { label: 'Fa', value: result.design_spectrum.Fa.toFixed(3), note: 'Short-period site coef' },
              { label: 'Fv', value: result.design_spectrum.Fv.toFixed(3), note: 'Long-period site coef' },
            ].map(({ label, value, note }) => (
              <div key={label} className="bg-indigo-50 rounded-lg p-2 text-center">
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-sm font-bold text-indigo-700">{value}</p>
                <p className="text-[10px] text-gray-400">{note}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Analysis */}
      <div className="border border-gray-200 rounded-xl p-4 bg-white space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Modal Analysis (OpenSees Eigenvalue)</h3>
        <div className="grid grid-cols-2 gap-3">
          <StatBox
            label="คาบธรรมชาติ T₁"
            value={`${result.modal_analysis.fundamental_period_T1_s} s`}
            sub={`ขีดจำกัด CuTa = ${result.modal_analysis.period_upper_limit_CuTa_s} s`}
            ok={result.modal_analysis.period_within_limit}
          />
          <StatBox
            label="Base Shear (OpenSees)"
            value={`${result.seismic_forces.base_shear_design_kn.toFixed(0)} kN`}
            sub={`น้ำหนักอาคาร W = ${result.seismic_forces.total_weight_kn.toFixed(0)} kN`}
            ok
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
                <th className="pb-1 font-medium">Mode</th>
                <th className="pb-1 px-2 font-medium">T (s)</th>
                <th className="pb-1 px-2 font-medium">Modal Mass (%)</th>
              </tr>
            </thead>
            <tbody>
              {result.modal_analysis.natural_periods_s.map((t, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-1 text-gray-600">{i + 1}</td>
                  <td className="py-1 px-2 font-mono">{t}</td>
                  <td className="py-1 px-2">
                    <span className="font-semibold text-indigo-600">
                      {result.modal_analysis.modal_mass_participation_pct[i]}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Story drift table */}
      <div className="border border-gray-200 rounded-xl p-4 bg-white">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Story Drift Check{' '}
          <span className="text-xs font-normal text-gray-400">(limit δ/h ≤ 2%)</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
                <th className="pb-1 font-medium">ชั้น</th>
                <th className="pb-1 px-2 font-medium">Drift (mm)</th>
                <th className="pb-1 px-2 font-medium">δ/h</th>
                <th className="pb-1 font-medium">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {result.seismic_forces.story_drift_checks.map((d: DriftCheck) => (
                <tr key={d.story} className="border-b border-gray-50">
                  <td className="py-1.5 text-gray-700 font-medium">{d.story}</td>
                  <td className="py-1.5 px-2 font-mono">{d.drift_mm}</td>
                  <td className="py-1.5 px-2 font-mono">
                    {(d.drift_ratio * 100).toFixed(3)}%
                  </td>
                  <td className="py-1.5">
                    {d.passed ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle2 size={12} /> ผ่าน
                      </span>
                    ) : (
                      <span className="text-red-600 flex items-center gap-1">
                        <XCircle size={12} /> ไม่ผ่าน
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cross-check results */}
      {result.cross_check_results.some((c) => c.status !== 'not_provided') && (
        <div className="border border-gray-200 rounded-xl p-4 bg-white">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Cross-Check – OpenSees vs วิศวกร
          </h3>
          <div className="space-y-2">
            {result.cross_check_results.map((c: CrossCheckItem) => (
              <div
                key={c.label}
                className={`rounded-lg p-3 border flex justify-between items-center ${getStatusColor(c.status)}`}
              >
                <div>
                  <p className="text-xs font-semibold">{c.label}</p>
                  <p className="text-[10px] mt-0.5 opacity-75">
                    OpenSees: <strong>{c.opensees}</strong>
                    {c.engineer !== null && (
                      <> · วิศวกร: <strong>{c.engineer}</strong> ({formatDeviation(c.deviation_pct)})</>
                    )}
                  </p>
                </div>
                <StatusBadge status={c.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, sub, ok }: { label: string; value: string; sub?: string; ok: boolean }) {
  return (
    <div className="border border-gray-100 rounded-lg p-3 bg-gray-50">
      <p className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-base font-bold text-gray-800 mt-0.5">{value}</p>
      {sub && (
        <p className={`text-[10px] mt-1 flex items-center gap-1 ${ok ? 'text-green-600' : 'text-red-500'}`}>
          {ok ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} />}
          {sub}
        </p>
      )}
    </div>
  );
}
