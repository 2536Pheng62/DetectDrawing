'use client';

import { useState, use } from 'react';
import Link from 'next/link';

interface MonthlyReportIndexProps {
    params: Promise<{ projectId: string }>;
}

export default function MonthlyReportIndex({ params }: MonthlyReportIndexProps) {
    const { projectId } = use(params);
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const monthNamesTh = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];

    const years = [currentYear, currentYear - 1]; // ย้อนหลัง 2 ปี
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    return (
        <div className="report-index">
            <header className="header">
                <Link href="/dashboard" className="back-btn">⬅️ กลับ</Link>
                <h1>เลือกรอบเดือนที่ต้องการสรุปผล</h1>
            </header>

            <div className="year-section">
                {years.map(year => (
                    <div key={year} className="year-block">
                        <h2 className="year-title">ปี พ.ศ. {year + 543}</h2>
                        <div className="month-grid">
                            {months.map(m => {
                                // ตรวจสอบว่าเดือนนั้นเลยปัจจุบันไปหรือยัง
                                const isFuture = year > currentYear || (year === currentYear && m > currentMonth);

                                return (
                                    <Link
                                        key={m}
                                        href={isFuture ? '#' : `/reports/monthly/${projectId}/${year}/${m}`}
                                        className={`month-card ${isFuture ? 'disabled' : ''}`}
                                    >
                                        <div className="month-num">{m}</div>
                                        <div className="month-name">{monthNamesTh[m - 1]}</div>
                                        {!isFuture && <div className="action-hint">ดูรายงาน ↗️</div>}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <style jsx>{`
                .report-index {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 32px 20px;
                }
                .header {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    margin-bottom: 32px;
                }
                .back-btn { text-decoration: none; padding: 8px 16px; background: #e2e8f0; border-radius: 8px; color: #475569; font-weight: 600; }
                .header h1 { margin: 0; font-size: 20px; color: #1e293b; }

                .year-block { margin-bottom: 40px; }
                .year-title { font-size: 18px; color: #64748b; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; }
                
                .month-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
                    gap: 12px;
                }
                .month-card {
                    background: white;
                    padding: 20px 12px;
                    border-radius: 12px;
                    text-decoration: none;
                    text-align: center;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.05);
                    transition: transform 0.2s, box-shadow 0.2s;
                    border: 1px solid #f1f5f9;
                }
                .month-card:hover:not(.disabled) { transform: translateY(-3px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-color: #2563eb; }
                .month-card.disabled { opacity: 0.4; cursor: not-allowed; background: #f8fafc; }

                .month-num { font-size: 24px; font-weight: 700; color: #2563eb; margin-bottom: 4px; }
                .month-name { font-size: 14px; color: #475569; margin-bottom: 12px; }
                .action-hint { font-size: 11px; color: #2563eb; font-weight: 600; opacity: 0.8; }
            `}</style>
        </div>
    );
}
