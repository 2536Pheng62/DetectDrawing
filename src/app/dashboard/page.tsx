'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SCurvePreview } from '@/components/SCurvePreview';
import {
    getDashboardSummary,
    getProvinceSummaries,
    getDelayedProjects,
    type DashboardSummary,
    type ProvinceSummary,
    type ProjectProgress,
} from '@/lib/progress-calculator';

interface StatusColor {
    bg: string;
    text: string;
    label: string;
}

const STATUS_COLORS: Record<string, StatusColor> = {
    ahead: { bg: '#e8f5e9', text: '#2e7d32', label: 'เร็วกว่าแผน' },
    'on-track': { bg: '#e8f5e9', text: '#2e7d32', label: 'ตามแผน' },
    delayed: { bg: '#fff3e0', text: '#ef6c00', label: 'ล่าช้า' },
    critical: { bg: '#ffebee', text: '#c62828', label: 'ล่าช้ามาก' },
    good: { bg: '#e8f5e9', text: '#2e7d32', label: 'ดี' },
    warning: { bg: '#fff3e0', text: '#ef6c00', label: 'ต้องติดตาม' },
};

/**
 * PM Dashboard - ภาพรวมทุกโครงการ
 * แสดงสถิติ, Provincial Summary, และ Alert โครงการล่าช้า
 */
export default function DashboardPage() {
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [provinces, setProvinces] = useState<ProvinceSummary[]>([]);
    const [delayedProjects, setDelayedProjects] = useState<ProjectProgress[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [summaryData, provincesData, delayedData] = await Promise.all([
                getDashboardSummary(),
                getProvinceSummaries(),
                getDelayedProjects(),
            ]);
            setSummary(summaryData);
            setProvinces(provincesData);
            setDelayedProjects(delayedData);
        } catch (err) {
            setError('ไม่สามารถโหลดข้อมูลได้');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatBudget = (amount: number) => {
        if (amount >= 1000000) {
            return `${(amount / 1000000).toFixed(2)} ล้านบาท`;
        }
        return `${amount.toLocaleString()} บาท`;
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner">⏳</div>
                <p>กำลังโหลดข้อมูล...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-error">
                <p>⚠️ {error}</p>
                <button onClick={loadDashboardData}>ลองใหม่</button>
            </div>
        );
    }

    return (
        <div className="dashboard">
            {/* Header */}
            <header className="dashboard-header">
                <h1>📊 แดชบอร์ดภาพรวมโครงการ</h1>
                <p className="subtitle">กองพัฒนาและบำรุงรักษาอาคารราชพัสดุ</p>
                <div className="header-actions">
                    <Link href="/arc/foundation/dashboard" className="arc-btn">
                        🏗️ ตรวจสอบฐานราก (ARC)
                    </Link>
                    <Link href="/arc/check" className="arc-btn" style={{ marginLeft: '10px', backgroundColor: '#8b5cf6' }}>
                        🔍 ตรวจสอบ BIM (IfcTester)
                    </Link>
                    <button onClick={loadDashboardData} className="refresh-btn">
                        🔄 รีเฟรช
                    </button>
                </div>
            </header>

            {/* Summary Cards */}
            <section className="summary-cards">
                <div className="card total">
                    <div className="card-icon">📋</div>
                    <div className="card-content">
                        <div className="card-value">{summary?.totalProjects || 0}</div>
                        <div className="card-label">โครงการทั้งหมด</div>
                    </div>
                </div>

                <div className="card budget">
                    <div className="card-icon">💰</div>
                    <div className="card-content">
                        <div className="card-value">{formatBudget(summary?.totalBudget || 0)}</div>
                        <div className="card-label">งบประมาณรวม</div>
                    </div>
                </div>

                <div className="card progress">
                    <div className="card-icon">📈</div>
                    <div className="card-content">
                        <div className="card-value">{summary?.avgProgress?.toFixed(1) || 0}%</div>
                        <div className="card-label">ความคืบหน้าเฉลี่ย</div>
                    </div>
                </div>

                <div className="card active">
                    <div className="card-icon">🚧</div>
                    <div className="card-content">
                        <div className="card-value">{summary?.activeProjects || 0}</div>
                        <div className="card-label">กำลังดำเนินการ</div>
                    </div>
                </div>

                <div className="card delayed">
                    <div className="card-icon">⚠️</div>
                    <div className="card-content">
                        <div className="card-value">{summary?.delayedProjects || 0}</div>
                        <div className="card-label">ล่าช้า</div>
                    </div>
                </div>

                <div className="card critical">
                    <div className="card-icon">🔴</div>
                    <div className="card-content">
                        <div className="card-value">{summary?.criticalProjects || 0}</div>
                        <div className="card-label">ล่าช้ามาก</div>
                    </div>
                </div>
            </section>

            {/* Provincial Summary */}
            <section className="section">
                <h2>🗺️ สรุปรายจังหวัด</h2>
                <div className="province-grid">
                    {provinces.map((province) => (
                        <div
                            key={province.provinceId}
                            className="province-card"
                            style={{
                                backgroundColor: STATUS_COLORS[province.status].bg,
                                borderLeftColor: STATUS_COLORS[province.status].text,
                            }}
                        >
                            <div className="province-header">
                                <h3>{province.provinceName}</h3>
                                <span
                                    className="status-badge"
                                    style={{
                                        backgroundColor: STATUS_COLORS[province.status].text,
                                    }}
                                >
                                    {STATUS_COLORS[province.status].label}
                                </span>
                            </div>
                            <div className="province-stats">
                                <div className="stat">
                                    <span className="stat-value">{province.projectCount}</span>
                                    <span className="stat-label">โครงการ</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-value">{province.avgProgress.toFixed(1)}%</span>
                                    <span className="stat-label">ความคืบหน้า</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-value">{province.delayedProjects}</span>
                                    <span className="stat-label">ล่าช้า</span>
                                </div>
                            </div>
                            {/* Progress Bar */}
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{
                                        width: `${Math.min(province.avgProgress, 100)}%`,
                                        backgroundColor: STATUS_COLORS[province.status].text,
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Delayed Projects Alert */}
            {delayedProjects.length > 0 && (
                <section className="section alert-section">
                    <h2>🚨 โครงการที่ต้องติดตาม</h2>
                    <div className="alert-list">
                        {delayedProjects.slice(0, 5).map((project) => (
                            <div
                                key={project.project.id}
                                className="alert-item"
                                style={{
                                    backgroundColor: STATUS_COLORS[project.status].bg,
                                }}
                            >
                                <div className="alert-info">
                                    <h4>{project.project.name}</h4>
                                    <p className="alert-province">{project.project.province_name}</p>
                                </div>
                                <div className="alert-progress">
                                    <span className="progress-actual">{project.totalProgress.toFixed(1)}%</span>
                                    <span className="progress-separator">vs</span>
                                    <span className="progress-planned">{project.plannedProgress.toFixed(1)}%</span>
                                </div>
                                <div className="alert-variance" style={{ color: STATUS_COLORS[project.status].text }}>
                                    {project.variance > 0 ? '+' : ''}{project.variance.toFixed(1)}%
                                </div>
                                <div className="alert-days">
                                    {project.daysRemaining} วันเหลือ
                                </div>
                                <div className="alert-actions">
                                    <SCurvePreview
                                        planned={[0, 20, 40, 60, 80, 100]}
                                        actual={[0, project.totalProgress]}
                                    />
                                    <Link href={`/reports/monthly/${project.project.id}`} className="report-link secondary">
                                        📊 รายงานรายเดือน
                                    </Link>
                                    <Link href={`/reports/project/${project.project.id}`} className="report-link secondary">
                                        📋 รายการรายวัน
                                    </Link>
                                    <Link href={`/reports/new?projectId=${project.project.id}`} className="report-link">
                                        📝 เขียนรายงาน
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <style jsx>{`
                .dashboard {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 24px;
                    font-family: system-ui, -apple-system, sans-serif;
                }
                .dashboard-header {
                    text-align: center;
                    margin-bottom: 32px;
                    position: relative;
                }
                .dashboard-header h1 {
                    font-size: 28px;
                    color: #1a237e;
                    margin: 0;
                }
                .subtitle {
                    color: #666;
                    margin: 8px 0;
                }
                .header-actions {
                    position: absolute;
                    right: 0;
                    top: 0;
                    display: flex;
                    gap: 12px;
                }
                .refresh-btn {
                    padding: 8px 16px;
                    background: #1976d2;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                }
                .arc-btn {
                    padding: 8px 16px;
                    background: #2563eb;
                    color: white;
                    text-decoration: none;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 600;
                    box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
                }
                .arc-btn:hover { background: #1d4ed8; }
                .summary-cards {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 16px;
                    margin-bottom: 32px;
                }
                .card {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 20px;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                }
                .card.delayed { border-left: 4px solid #ef6c00; }
                .card.critical { border-left: 4px solid #c62828; }
                .card-icon { font-size: 32px; }
                .card-value { font-size: 24px; font-weight: 700; color: #333; }
                .card-label { font-size: 13px; color: #666; }
                .section {
                    background: white;
                    border-radius: 12px;
                    padding: 24px;
                    margin-bottom: 24px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                }
                .section h2 {
                    margin: 0 0 20px 0;
                    font-size: 20px;
                    color: #333;
                }
                .province-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 16px;
                }
                .province-card {
                    padding: 16px;
                    border-radius: 8px;
                    border-left: 4px solid;
                }
                .province-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }
                .province-header h3 { margin: 0; font-size: 16px; }
                .status-badge {
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 11px;
                    color: white;
                }
                .province-stats {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 12px;
                }
                .stat { text-align: center; }
                .stat-value { display: block; font-size: 18px; font-weight: 600; }
                .stat-label { font-size: 11px; color: #666; }
                .progress-bar {
                    height: 6px;
                    background: rgba(0,0,0,0.1);
                    border-radius: 3px;
                    overflow: hidden;
                }
                .progress-fill {
                    height: 100%;
                    transition: width 0.5s ease;
                }
                .alert-section { background: #fff8e1; }
                .alert-list { display: flex; flex-direction: column; gap: 12px; }
                .alert-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px;
                    border-radius: 8px;
                }
                .alert-info h4 { margin: 0; font-size: 14px; }
                .alert-province { margin: 0; font-size: 12px; color: #666; }
                .alert-progress { text-align: center; }
                .progress-actual { font-weight: 600; color: #333; }
                .progress-separator { color: #999; margin: 0 4px; }
                .progress-planned { color: #666; }
                .alert-variance { font-weight: 700; font-size: 16px; }
                .alert-days { font-size: 12px; color: #666; margin: 0 12px; }
                .alert-actions {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 8px;
                }
                .report-link {
                    font-size: 12px;
                    background: #2563eb;
                    padding: 4px 10px;
                    border-radius: 6px;
                    text-decoration: none;
                    color: white;
                    font-weight: 600;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    border: 1px solid #2563eb;
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                }
                .report-link.secondary {
                    background: white;
                    color: #475569;
                    border-color: #e2e8f0;
                }
                .report-link:hover { opacity: 0.9; transform: translateY(-1px); }
                .report-link.secondary:hover { background: #f8fafc; border-color: #cbd5e1; color: #1e293b; }
                .dashboard-loading, .dashboard-error {
                    text-align: center;
                    padding: 60px;
                }
                .spinner { font-size: 48px; }
            `}</style>
        </div>
    );
}
