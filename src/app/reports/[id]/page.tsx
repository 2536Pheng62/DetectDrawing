'use client';

import { useState, useEffect, use } from 'react';
import { getSupabase } from '@/lib/supabase';
import { ExportPDFButton, PreviewPDFButton } from '@/components/ExportPDFButton';
import { type DailyReport, type WorkItem, type Photo, type Signature, WEATHER_LABELS, REPORT_STATUS_LABELS } from '@/types/database';
import { calculateWeightedProgress } from '@/lib/progress-calculator';
import Link from 'next/link';

interface ReportDetailProps {
    params: Promise<{ id: string }>;
}

/**
 * หน้าแสดงรายละเอียดรายงานประจำวัน (Read-only)
 * - แสดงข้อมูลครบถ้วน: งาน, อากาศ, แรงงาน, รูปภาพ, ลายเซ็น
 * - มีระบบ Export PDF
 */
export default function ReportDetailPage({ params }: ReportDetailProps) {
    const { id: reportId } = use(params);
    const [report, setReport] = useState<DailyReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadReportData();
    }, [reportId]);

    const loadReportData = async () => {
        try {
            setLoading(true);
            const supabase = getSupabase();

            const { data, error: fetchError } = await supabase
                .from('daily_reports')
                .select(`
                    *,
                    project:projects (
                        *,
                        province:provinces (*)
                    ),
                    inspector:users!inspector_id (*),
                    work_items (*),
                    photos (*),
                    signatures (*)
                `)
                .eq('id', reportId)
                .single();

            if (fetchError) throw fetchError;
            setReport(data);
        } catch (err) {
            console.error('Error loading report:', err);
            setError('ไม่สามารถโหลดข้อมูลรายงานได้');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">⏳ กำลังโหลดข้อมูล...</div>;
    if (error || !report) return <div className="error">⚠️ {error || 'ไม่พบข้อมูลรายงาน'}</div>;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
        });
    };

    // คำนวณความคืบหน้ารวม
    const totalProgress = report.work_items ? calculateWeightedProgress(report.work_items) : 0;

    // เตรียมข้อมูลสำหรับ PDF Export
    const pdfData = {
        projectName: report.project?.name || 'ไม่ระบุ',
        contractNumber: report.project?.contract_number || '-',
        reportDate: report.report_date,
        totalProgress: totalProgress,
        weather: report.weather || 'sunny',
        temperature: report.temperature,
        humidity: report.humidity,
        workSummary: report.work_summary || '-',
        issues: report.issues || '-',
        laborCount: report.labor_count,
        equipmentNotes: report.equipment_notes || '-',
        workItems: report.work_items || [],
        signatures: report.signatures || [],
    };

    return (
        <div className="report-detail">
            {/* Navigation Header */}
            <nav className="detail-nav">
                <Link href="/admin/approval" className="back-link">
                    ⬅️ กลับไปหน้าหลัก
                </Link>
                <div className="status-container">
                    <span className={`status-badge ${report.status}`}>
                        {REPORT_STATUS_LABELS[report.status]}
                    </span>
                </div>
            </nav>

            {/* Header Section */}
            <header className="report-header">
                <h1>บันทึกรายงานประจำวัน</h1>
                <p className="project-name">{report.project?.name}</p>
                <p className="report-date">{formatDate(report.report_date)}</p>
            </header>

            {/* Export Buttons */}
            <div className="actions-bar">
                <PreviewPDFButton
                    reportData={pdfData}
                    photos={report.photos || []}
                />
                <ExportPDFButton
                    reportData={pdfData}
                    photos={report.photos || []}
                    fileName={`Report_${report.project?.name}_${report.report_date}.pdf`}
                />
            </div>

            {/* Weather & Info Grid */}
            <section className="info-grid">
                <div className="info-card">
                    <h3>🌤️ สภาพอากาศ</h3>
                    <div className="info-content">
                        <p><strong>สถานะ:</strong> {WEATHER_LABELS[report.weather || 'sunny']}</p>
                        <p><strong>อุณหภูมิ:</strong> {report.temperature ?? '-'} °C</p>
                        <p><strong>ความชื้น:</strong> {report.humidity ?? '-'} %</p>
                    </div>
                </div>
                <div className="info-card">
                    <h3>👷 ข้อมูลพื้นฐาน</h3>
                    <div className="info-content">
                        <p><strong>แรงงานวันนี้:</strong> {report.labor_count} คน</p>
                        <p><strong>ผู้ควบคุมงาน:</strong> {report.inspector?.full_name}</p>
                        {report.rejection_reason && (
                            <p className="rejection-msg">⚠️ <strong>เหตุผลที่ส่งกลับ:</strong> {report.rejection_reason}</p>
                        )}
                    </div>
                </div>
            </section>

            {/* Work Items Table */}
            <section className="section">
                <h2>📊 สรุปปริมาณงาน</h2>
                <div className="table-wrapper">
                    <table className="work-table">
                        <thead>
                            <tr>
                                <th>รายการงาน</th>
                                <th>หน่วย</th>
                                <th className="num">แผน</th>
                                <th className="num">ทำได้จริง</th>
                                <th className="num">% งาน</th>
                            </tr>
                        </thead>
                        <tbody>
                            {report.work_items?.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.task_name}</td>
                                    <td>{item.unit}</td>
                                    <td className="num">{item.planned_quantity}</td>
                                    <td className="num">{item.actual_quantity}</td>
                                    <td className="num">
                                        <span className="progress-tag">
                                            {item.progress_percent.toFixed(1)}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Summaries */}
            <section className="section">
                <h2>📝 สรุปรายละเอียด</h2>
                <div className="summary-box">
                    <strong>ผลงานที่ปฏิบัติ:</strong>
                    <p>{report.work_summary || 'ไม่มีข้อมูล'}</p>
                </div>
                <div className="summary-box">
                    <strong>ปัญหาและอุปสรรค:</strong>
                    <p>{report.issues || 'ไม่มีปัญหา'}</p>
                </div>
                <div className="summary-box">
                    <strong>เครื่องจักรและอุปกรณ์:</strong>
                    <p>{report.equipment_notes || '-'}</p>
                </div>
            </section>

            {/* Photo Gallery */}
            {report.photos && report.photos.length > 0 && (
                <section className="section">
                    <h2>📸 ภาพประกอบ ({report.photos.length} รูป)</h2>
                    <div className="photo-gallery">
                        {report.photos.map((photo) => (
                            <div key={photo.id} className="photo-card">
                                <img src={photo.file_url} alt={photo.caption || 'ภาพผลงาน'} />
                                <div className="photo-info">
                                    <p className="caption">{photo.caption}</p>
                                    <p className="meta">
                                        📍 {photo.latitude?.toFixed(5)}, {photo.longitude?.toFixed(5)}
                                    </p>
                                    <p className="meta">
                                        ⏰ {new Date(photo.taken_at || '').toLocaleString('th-TH')}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Signatures */}
            <section className="section">
                <h2>🖋️ รายมือชื่อ</h2>
                <div className="signature-grid">
                    {['inspector', 'contractor', 'approver'].map((type) => {
                        const sig = report.signatures?.find(s => s.signer_type === type);
                        return (
                            <div key={type} className="sig-card">
                                <p className="sig-label">
                                    {type === 'inspector' ? 'ผู้ควบคุมงาน' : type === 'contractor' ? 'ผู้รับจ้าง' : 'ผู้อนุมัติ'}
                                </p>
                                <div className="sig-box">
                                    {sig?.signature_image_url ? (
                                        <img src={sig.signature_image_url} alt="Signature" />
                                    ) : (
                                        <span className="no-sig">(ยังไม่ได้ลงนาม)</span>
                                    )}
                                </div>
                                <p className="sig-name">{sig?.signer_name || '-'}</p>
                            </div>
                        );
                    })}
                </div>
            </section>

            <style jsx>{`
                .report-detail {
                    max-width: 800px;
                    margin: 20px auto;
                    padding: 24px;
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 4px 24px rgba(0,0,0,0.06);
                }
                .detail-nav {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 32px;
                }
                .back-link {
                    color: #2563eb;
                    text-decoration: none;
                    font-weight: 500;
                }
                .status-badge {
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 13px;
                    font-weight: 600;
                }
                .status-badge.approved { background: #e8f5e9; color: #2e7d32; }
                .status-badge.submitted { background: #fff3e0; color: #ef6c00; }
                .status-badge.rejected { background: #ffebee; color: #c62828; }
                .status-badge.draft { background: #f5f5f5; color: #757575; }

                .report-header {
                    text-align: center;
                    margin-bottom: 40px;
                }
                .report-header h1 { margin: 0; font-size: 24px; color: #1a237e; }
                .project-name { font-size: 18px; color: #455a64; margin: 8px 0; }
                .report-date { color: #78909c; }

                .actions-bar {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 32px;
                    justify-content: center;
                }

                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    margin-bottom: 32px;
                }
                .info-card {
                    padding: 16px;
                    background: #f8fafc;
                    border-radius: 12px;
                }
                .info-card h3 { margin: 0 0 12px 0; font-size: 15px; color: #1e293b; }
                .info-content p { margin: 6px 0; font-size: 14px; color: #475569; }
                .rejection-msg { color: #dc2626; background: #fee2e2; padding: 8px; border-radius: 4px; margin-top: 8px; }

                .section { margin-bottom: 40px; }
                .section h2 { font-size: 18px; color: #1e293b; border-left: 4px solid #2563eb; padding-left: 12px; margin-bottom: 20px; }

                .table-wrapper { overflow-x: auto; background: white; border: 1px solid #e2e8f0; border-radius: 8px; }
                .work-table { width: 100%; border-collapse: collapse; font-size: 14px; }
                .work-table th { background: #f8fafc; padding: 12px; text-align: left; color: #64748b; }
                .work-table td { padding: 12px; border-top: 1px solid #e2e8f0; }
                .num { text-align: right; }
                .progress-tag { background: #eff6ff; color: #1d4ed8; padding: 2px 8px; border-radius: 12px; font-weight: 600; }

                .summary-box { padding: 16px; border-bottom: 1px solid #f1f5f9; }
                .summary-box:last-child { border-bottom: none; }
                .summary-box strong { display: block; margin-bottom: 6px; font-size: 14px; color: #64748b; }
                .summary-box p { margin: 0; color: #1e293b; line-height: 1.6; }

                .photo-gallery {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
                    gap: 16px;
                }
                .photo-card { border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
                .photo-card img { width: 100%; height: 160px; object-fit: cover; }
                .photo-info { padding: 12px; }
                .caption { font-weight: 500; margin: 0 0 8px 0; font-size: 14px; }
                .meta { font-size: 11px; color: #94a3b8; margin: 2px 0; }

                .signature-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                }
                .sig-card { text-align: center; }
                .sig-label { font-weight: 600; color: #64748b; margin-bottom: 12px; }
                .sig-box {
                    height: 100px;
                    background: #f8fafc;
                    border: 2px dashed #e2e8f0;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 8px;
                }
                .sig-box img { max-height: 80px; max-width: 90%; }
                .no-sig { color: #cbd5e1; font-style: italic; font-size: 13px; }
                .sig-name { font-weight: 500; color: #1e293b; }

                .loading, .error { text-align: center; padding: 100px; font-size: 18px; }
                .error { color: #dc2626; }
            `}</style>
        </div>
    );
}
