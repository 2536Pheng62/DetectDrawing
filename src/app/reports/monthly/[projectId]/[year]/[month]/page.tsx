'use client';

import { useState, useEffect, use } from 'react';
import { getMonthlyReportData, type MonthlyReportData } from '@/lib/monthly-report';
import { ExportPDFButton } from '@/components/ExportPDFButton';
import Link from 'next/link';

interface MonthlyReportPageProps {
    params: Promise<{ projectId: string; year: string; month: string }>;
}

export default function MonthlyReportPage({ params }: MonthlyReportPageProps) {
    const { projectId, year, month } = use(params);
    const [report, setReport] = useState<MonthlyReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const monthNamesTh = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];

    useEffect(() => {
        loadData();
    }, [projectId, year, month]);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await getMonthlyReportData(projectId, parseInt(year), parseInt(month));
            setReport(data);
        } catch (err) {
            console.error(err);
            setError('ไม่สามารถโหลดข้อมูลรายงานประจำเดือนได้');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">⏳ กำลังประมวลผลข้อมูลรายเดือน...</div>;
    if (error || !report) return <div className="error">⚠️ {error || 'ไม่พบข้อมูล'}</div>;

    return (
        <div className="monthly-report">
            <nav className="nav-bar">
                <Link href="/dashboard" className="back-link">⬅️ กลับหน้าหลัก</Link>
                <div className="actions">
                    <ExportPDFButton
                        reportData={{
                            ...report,
                            reportDate: `${year}-${month}-01`, // สำหรับ PDF template กว้างๆ
                            workSummary: `สรุปงานประจำเดือน ${monthNamesTh[parseInt(month) - 1]} พ.ศ. ${parseInt(year) + 543}`,
                            weather: 'sunny', // Placeholder สำหรับ Template รวม
                            laborCount: report.totalLabor, // รวมยอดทั้งเดือนมาแสดงในช่องนี้
                            workItems: report.workItems.map(item => ({
                                task_name: item.task_name,
                                unit: item.unit,
                                planned_quantity: item.total_planned,
                                actual_quantity: item.total_actual,
                                progress_percent: item.progress_percent,
                                weight: item.weight
                            }))
                        }}
                        photos={[]} // ในรายงานประจำเดือนอาจจะเลือกรูปเด่นมาแสดง
                        fileName={`Monthly_Report_${report.projectName}_${year}_${month}.pdf`}
                    />
                </div>
            </nav>

            <header className="report-header">
                <h1>รายงานความก้าวหน้าการก่อสร้างประจำเดือน</h1>
                <h2>{monthNamesTh[parseInt(month) - 1]} {parseInt(year) + 543}</h2>
                <p className="project-name">{report.projectName}</p>
            </header>

            <section className="summary-grid">
                <div className="stat-card">
                    <label>ความคืบหน้าสะสม</label>
                    <div className="value">{report.totalProgress.toFixed(2)}%</div>
                </div>
                <div className="stat-card">
                    <label>ความก้าวหน้าเดือนนี้</label>
                    <div className="value highlight">+{report.monthlyProgress.toFixed(2)}%</div>
                </div>
                <div className="stat-card">
                    <label>แรงงานสะสม (คน-วัน)</label>
                    <div className="value">{report.totalLabor}</div>
                </div>
                <div className="stat-card">
                    <label>ภาพถ่ายหน้างาน</label>
                    <div className="value">{report.photoCount} รูป</div>
                </div>
            </section>

            <section className="section">
                <h3>📊 สรุปความก้าวหน้าแยกตามหมวดงาน</h3>
                <div className="table-wrapper">
                    <table className="work-table">
                        <thead>
                            <tr>
                                <th>รายการงาน</th>
                                <th>หน่วย</th>
                                <th className="num">ปริมาณงาน</th>
                                <th className="num">สะสม</th>
                                <th className="num">% สะสม</th>
                            </tr>
                        </thead>
                        <tbody>
                            {report.workItems.map((item, idx) => (
                                <tr key={idx}>
                                    <td>{item.task_name}</td>
                                    <td>{item.unit}</td>
                                    <td className="num">{item.total_planned.toLocaleString()}</td>
                                    <td className="num">{item.total_actual.toLocaleString()}</td>
                                    <td className="num">
                                        <div className="progress-cell">
                                            <div className="mini-bar">
                                                <div className="fill" style={{ width: `${item.progress_percent}%` }}></div>
                                            </div>
                                            <span>{item.progress_percent.toFixed(1)}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="section">
                <h3>⚠️ ปัญหาและอุปสรรคที่พบในเดือนนี้</h3>
                {report.allIssues.length === 0 ? (
                    <p className="no-data">ไม่มีรายการปัญหาที่บันทึกไว้</p>
                ) : (
                    <ul className="issue-list">
                        {report.allIssues.map((issue, idx) => (
                            <li key={idx}>
                                <strong>{new Date(issue.date).toLocaleDateString('th-TH')}:</strong> {issue.issue}
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <style jsx>{`
                .monthly-report {
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 24px;
                    background: #f8fafc;
                    min-height: 100vh;
                }
                .nav-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 32px;
                }
                .back-link { text-decoration: none; color: #64748b; font-weight: 500; }
                
                .report-header {
                    text-align: center;
                    background: white;
                    padding: 40px;
                    border-radius: 20px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                    margin-bottom: 24px;
                }
                .report-header h1 { margin: 0; font-size: 24px; color: #1e293b; }
                .report-header h2 { margin: 8px 0; font-size: 20px; color: #2563eb; }
                .project-name { color: #64748b; font-size: 16px; margin: 0; }

                .summary-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px;
                    margin-bottom: 24px;
                }
                .stat-card {
                    background: white;
                    padding: 20px;
                    border-radius: 16px;
                    text-align: center;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.04);
                }
                .stat-card label { display: block; font-size: 13px; color: #64748b; margin-bottom: 8px; }
                .stat-card .value { font-size: 24px; font-weight: 700; color: #1e293b; }
                .stat-card .value.highlight { color: #16a34a; }

                .section {
                    background: white;
                    padding: 24px;
                    border-radius: 16px;
                    margin-bottom: 24px;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.04);
                }
                .section h3 { margin: 0 0 20px 0; font-size: 18px; color: #334155; border-left: 4px solid #2563eb; padding-left: 12px; }

                .table-wrapper { overflow-x: auto; }
                .work-table { width: 100%; border-collapse: collapse; font-size: 14px; }
                .work-table th { text-align: left; padding: 12px; background: #f8fafc; color: #64748b; }
                .work-table td { padding: 12px; border-top: 1px solid #f1f5f9; }
                .num { text-align: right; }

                .progress-cell { display: flex; align-items: center; gap: 8px; justify-content: flex-end; }
                .mini-bar { width: 60px; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden; }
                .mini-bar .fill { height: 100%; background: #2563eb; }

                .issue-list { list-style: none; padding: 0; margin: 0; }
                .issue-list li { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #475569; }
                .issue-list li:last-child { border-bottom: none; }
                .no-data { text-align: center; color: #94a3b8; font-style: italic; }

                .loading, .error { text-align: center; padding: 100px; font-size: 18px; color: #64748b; }
            `}</style>
        </div>
    );
}
