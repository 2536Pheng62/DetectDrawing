import Link from 'next/link';
import {
  BarChart3,
  CheckSquare,
  FileText,
  HardHat,
  Info,
} from 'lucide-react';

const ARC_TOOLS = [
  {
    href: '/arc/check',
    icon: CheckSquare,
    color: 'blue',
    title: 'ตรวจสอบ IFC / BIM',
    subtitle: 'IfcTester · กฎกระทรวงวัสดุ พ.ศ. 2566',
    description:
      'อัปโหลดไฟล์ IFC จากโปรแกรม BIM (Revit, ArchiCAD ฯลฯ) เพื่อตรวจสอบให้ตรงกับ IDS rules กฎกระทรวงวัสดุก่อสร้าง',
    tags: ['IFC', 'IfcTester', 'IDS', 'BIM'],
  },
  {
    href: '/arc/foundation/dashboard',
    icon: HardHat,
    color: 'amber',
    title: 'ฐานราก & เสาเข็ม',
    subtitle: 'IfcFooting · IfcPile · AABB Geometry',
    description:
      'สกัดข้อมูลฐานรากและเสาเข็มจากไฟล์ IFC พร้อมขนาด AABB (กว้าง/ยาว/หนา), Pset properties, วัสดุ',
    tags: ['Foundation', 'Pile', 'IfcFooting', 'Geometry'],
  },
  {
    href: '/arc/seismic',
    icon: BarChart3,
    color: 'indigo',
    title: 'วิเคราะห์แผ่นดินไหว',
    subtitle: 'OpenSeesPy · มยผ. 1302-52',
    description:
      'Modal Analysis แบบ Shear-Building ด้วย OpenSeesPy คำนวณ Design Spectrum, Base Shear, Story Drift และ Cross-check กับค่าวิศวกร',
    tags: ['Seismic', 'OpenSeesPy', 'มยผ.1302', 'Modal Analysis'],
  },
  {
    href: '/arc/pdf-check',
    icon: FileText,
    color: 'violet',
    title: 'วิเคราะห์ PDF แปลน',
    subtitle: 'PyMuPDF · OpenCV · Tesseract',
    description:
      'อ่านแปลน 2D จากไฟล์ PDF ตรวจสอบระยะร่น, ขนาดห้อง, FAR/BCR และนับสัญลักษณ์สถาปัตยกรรม ตามกฎกระทรวงฉบับที่ 55/39',
    tags: ['PDF', 'กฎกระทรวง 55', 'Scale', 'Computer Vision'],
  },
];

const COLOR_MAP: Record<string, { bg: string; icon: string; tag: string; border: string }> = {
  blue:   { bg: 'bg-blue-50',   icon: 'text-blue-600',   tag: 'bg-blue-100 text-blue-700',   border: 'border-blue-200' },
  amber:  { bg: 'bg-amber-50',  icon: 'text-amber-600',  tag: 'bg-amber-100 text-amber-700',  border: 'border-amber-200' },
  indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600', tag: 'bg-indigo-100 text-indigo-700', border: 'border-indigo-200' },
  violet: { bg: 'bg-violet-50', icon: 'text-violet-600', tag: 'bg-violet-100 text-violet-700', border: 'border-violet-200' },
};

export default function ArcHubPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">🏗️ ARC — ตรวจสอบแบบแปลนอัตโนมัติ</h1>
        <p className="mt-2 text-gray-500 text-sm">
          เครื่องมือวิเคราะห์ทางวิศวกรรมและสถาปัตยกรรมอัตโนมัติ ใช้ AI + OpenSeesPy + IfcOpenShell
        </p>
      </div>

      {/* Notice */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 text-sm text-blue-800">
        <Info size={16} className="mt-0.5 shrink-0 text-blue-500" />
        <p>
          ระบบ ARC ต้องการ <strong>Docker containers</strong> ทำงานอยู่เบื้องหลัง (ports 8001–8003)
          ตรวจสอบที่ <code className="bg-blue-100 px-1 rounded">docker compose ps</code>
        </p>
      </div>

      {/* Tool Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {ARC_TOOLS.map(tool => {
          const c = COLOR_MAP[tool.color];
          return (
            <Link
              key={tool.href}
              href={tool.href}
              className={`group block rounded-2xl border ${c.border} bg-white p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5`}
            >
              {/* Icon */}
              <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center mb-4`}>
                <tool.icon size={22} className={c.icon} />
              </div>

              {/* Title */}
              <h2 className="font-semibold text-gray-900 text-base leading-tight">{tool.title}</h2>
              <p className="text-xs text-gray-400 mt-0.5 mb-3">{tool.subtitle}</p>

              {/* Description */}
              <p className="text-sm text-gray-600 leading-relaxed mb-4">{tool.description}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {tool.tags.map(tag => (
                  <span key={tag} className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.tag}`}>
                    {tag}
                  </span>
                ))}
              </div>

              {/* Arrow */}
              <div className="mt-4 text-xs font-semibold text-gray-400 group-hover:text-gray-700 transition-colors">
                เปิดเครื่องมือ →
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
