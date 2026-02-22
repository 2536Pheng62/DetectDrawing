'use client';

import { useState, useEffect, use } from 'react';
import { getSupabase } from '@/lib/supabase';
import { type DailyReport, REPORT_STATUS_LABELS } from '@/types/database';
import Link from 'next/link';

interface ProjectReportsPageProps {
    params: Promise<{ projectId: string }>;
}

export default function ProjectReportsPage({ params }: ProjectReportsPageProps) {
    const { projectId } = use(params);
    const [reports, setReports] = useState<DailyReport[]>([]);
    const [projectName, setProjectName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, [projectId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const supabase = getSupabase();

            // ดึงชื่อโครงการ
            const { data: project } = await supabase
                .from('projects')
                .select('name')
                .eq('id', projectId)
                .single();

            if (project) setProjectName(project.name);

            // ดึงรายการรายงาน
            const { data, error: fetchError } = await supabase
                .from('daily_reports')
                .select('*')
                .eq('project_id', projectId)
                .order('report_date', { ascending: false });

            if (fetchError) throw fetchError;
            setReports(data || []);
        } catch (err) {
            console.error('Error loading reports:', err);
            setError('ไม่สามารถโหลดข้อมูลรายการรายงานได้');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            weekday: 'short',
        });
    };

    if (loading) return <div className="loading">⏳ กำลังโหลดรายการรายงาน...</div>;

    return (
        <div className="reports-list-container">
            <header className="header">
                <Link href="/dashboard" className="back-btn">⬅️ กลับ</Link>
                <h1>รายการรายงานประจำวัน</h1>
            </header>

            <div className="project-info">
                <h2>{projectName}</h2>
                <Link href={`/reports/new?projectId=${projectId}`} className="new-report-btn">
                    ➕ เขียนรายงานใหม่
                </Link>
            </div>

            {error ? (
                <div className="error">⚠️ {error}</div>
            ) : reports.length === 0 ? (
                <div className="empty-state">
                    <p>ยังไม่มีการบันทึกรายงานในโครงการนี้</p>
                    <Link href={`/reports/new?projectId=${projectId}`}>เริ่มเขียนรายงานฉบับแรก</Link>
                </div>
            ) : (
                <div className="report-grid">
                    {reports.map((report) => (
                        <Link
                            key={report.id}
                            href={`/reports/${report.id}`}
                            className="report-card"
                        >
                            <div className="report-main">
                                <div className="date-box">
                                    <span className="day">{new Date(report.report_date).getDate()}</span>
                                    <span className="month">
                                        {new Date(report.report_date).toLocaleDateString('th-TH', { month: 'short' })}
                                    </span>
                                </div>
                                <div className="report-info">
                                    <div className="date-full">{formatDate(report.report_date)}</div>
                                    <div className="summary-preview">
                                        {report.work_summary || 'ไม่มีสรุปผลงาน'}
                                    </div>
                                </div>
                            </div>
                            <div className="report-footer">
                                <span className={`status-tag ${report.status}`}>
                                    {REPORT_STATUS_LABELS[report.status]}
                                </span>
                                <span className="view-text">ดูรายละเอียด ↗️</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            <style jsx>{`
                .reports-list-container {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 24px 16px;
                }
                .header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
                .back-btn { text-decoration: none; padding: 8px 16px; background: #f1f5f9; border-radius: 8px; color: #475569; font-weight: 600; }
                .header h1 { font-size: 18px; color: #1e293b; margin: 0; }

                .project-info {
                    background: white;
                    padding: 24px;
                    border-radius: 12px;
                    margin-bottom: 24px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 16px;
                }
                .project-info h2 { font-size: 18px; color: #1a237e; margin: 0; }
                .new-report-btn {
                    background: #2563eb;
                    color: white;
                    text-decoration: none;
                    padding: 10px 18px;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 14px;
                    white-space: nowrap;
                }

                .report-grid { display: flex; flex-direction: column; gap: 12px; }
                .report-card {
                    background: white;
                    border-radius: 12px;
                    padding: 16px;
                    text-decoration: none;
                    border: 1px solid #e2e8f0;
                    transition: transform 0.2s, border-color 0.2s;
                }
                .report-card:hover { transform: translateY(-2px); border-color: #2563eb; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }

                .report-main { display: flex; gap: 16px; margin-bottom: 12px; }
                .date-box {
                    width: 50px;
                    height: 50px;
                    background: #eff6ff;
                    border-radius: 8px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: #2563eb;
                }
                .date-box .day { font-size: 18px; font-weight: 700; line-height: 1; }
                .date-box .month { font-size: 11px; font-weight: 600; }

                .report-info { flex: 1; }
                .date-full { font-size: 14px; font-weight: 600; color: #1e293b; margin-bottom: 4px; }
                .summary-preview {
                    font-size: 13px;
                    color: #64748b;
                    display: -webkit-box;
                    -webkit-line-clamp: 1;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .report-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-top: 12px;
                    border-top: 1px solid #f1f5f9;
                }
                .status-tag {
                    font-size: 11px;
                    font-weight: 700;
                    padding: 2px 8px;
                    border-radius: 4px;
                }
                .status-tag.approved { background: #e8f5e9; color: #16a34a; }
                .status-tag.submitted { background: #fff7ed; color: #c2410c; }
                .status-tag.rejected { background: #fef2f2; color: #dc2626; }
                .status-tag.draft { background: #f8fafc; color: #64748b; }

                .view-text { font-size: 12px; color: #2563eb; font-weight: 600; }

                .empty-state { text-align: center; padding: 60px 20px; color: #64748b; }
                .empty-state a { color: #2563eb; font-weight: 600; margin-top: 8px; display: block; }
                .loading { text-align: center; padding: 100px; color: #64748b; }
            `}</style>
        </div>
    );
}
