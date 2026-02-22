'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';
import {
    sendApprovalNotification,
    sendRejectionNotification,
} from '@/lib/notifications';

// Interfaces
interface ReportForApproval {
    id: string;
    report_date: string;
    weather: string;
    work_summary: string;
    labor_count: number;
    status: string;
    submitted_at?: string;
    rejection_count: number;
    project: {
        id: string;
        name: string;
        province_name?: string;
    };
    inspector: {
        id: string;
        full_name: string;
        email: string;
    };
}

/**
 * Admin Approval Page
 * - Queue รายงานที่รอตรวจสอบ
 * - Approve/Reject with Comments
 * - History section
 */
export default function ApprovalPage() {
    const [pendingReports, setPendingReports] = useState<ReportForApproval[]>([]);
    const [recentlyProcessed, setRecentlyProcessed] = useState<ReportForApproval[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState<ReportForApproval | null>(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [processing, setProcessing] = useState(false);
    const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

    useEffect(() => {
        loadReports();
    }, []);

    const loadReports = async () => {
        setLoading(true);
        const supabase = getSupabase();

        // ดึงรายงานที่รอตรวจสอบ
        const { data: pending } = await supabase
            .from('daily_reports')
            .select(`
                id,
                report_date,
                weather,
                work_summary,
                labor_count,
                status,
                submitted_at,
                rejection_count,
                projects (id, name, provinces (name)),
                users!inspector_id (id, full_name, email)
            `)
            .eq('status', 'submitted')
            .order('submitted_at', { ascending: true });

        // ดึงรายงานที่ดำเนินการแล้ว (7 วันล่าสุด)
        const { data: processed } = await supabase
            .from('daily_reports')
            .select(`
                id,
                report_date,
                weather,
                work_summary,
                labor_count,
                status,
                submitted_at,
                rejection_count,
                projects (id, name, provinces (name)),
                users!inspector_id (id, full_name, email)
            `)
            .in('status', ['approved', 'rejected'])
            .gte('submitted_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
            .order('submitted_at', { ascending: false })
            .limit(20);

        // Transform data
        const transformReport = (r: any): ReportForApproval => ({
            id: r.id,
            report_date: r.report_date,
            weather: r.weather,
            work_summary: r.work_summary,
            labor_count: r.labor_count,
            status: r.status,
            submitted_at: r.submitted_at,
            rejection_count: r.rejection_count || 0,
            project: {
                id: r.projects?.id,
                name: r.projects?.name || 'ไม่ระบุ',
                province_name: r.projects?.provinces?.name,
            },
            inspector: {
                id: r.users?.id,
                full_name: r.users?.full_name || 'ไม่ระบุ',
                email: r.users?.email,
            },
        });

        setPendingReports((pending || []).map(transformReport));
        setRecentlyProcessed((processed || []).map(transformReport));
        setLoading(false);
    };

    const handleApprove = async (report: ReportForApproval) => {
        if (!confirm(`ยืนยันอนุมัติรายงานของ "${report.project.name}"?`)) return;

        setProcessing(true);
        const supabase = getSupabase();

        const { error } = await supabase
            .from('daily_reports')
            .update({
                status: 'approved',
                approved_at: new Date().toISOString(),
                // TODO: approved_by: currentUser.id
            })
            .eq('id', report.id);

        if (error) {
            alert('เกิดข้อผิดพลาด: ' + error.message);
        } else {
            // ส่ง notification
            await sendApprovalNotification(
                report.inspector.id,
                report.id,
                report.project.name,
                report.report_date
            );
            await loadReports();
        }
        setProcessing(false);
    };

    const handleReject = async () => {
        if (!selectedReport || !rejectReason.trim()) {
            alert('กรุณาระบุเหตุผลในการส่งกลับ');
            return;
        }

        setProcessing(true);
        const supabase = getSupabase();

        const { error } = await supabase
            .from('daily_reports')
            .update({
                status: 'rejected',
                rejection_reason: rejectReason,
                rejection_count: (selectedReport.rejection_count || 0) + 1,
            })
            .eq('id', selectedReport.id);

        if (error) {
            alert('เกิดข้อผิดพลาด: ' + error.message);
        } else {
            // ส่ง notification
            await sendRejectionNotification(
                selectedReport.inspector.id,
                selectedReport.id,
                selectedReport.project.name,
                selectedReport.report_date,
                rejectReason
            );
            setShowRejectModal(false);
            setRejectReason('');
            setSelectedReport(null);
            await loadReports();
        }
        setProcessing(false);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, { bg: string; text: string; label: string }> = {
            submitted: { bg: '#fff3e0', text: '#ef6c00', label: '⏳ รอตรวจสอบ' },
            approved: { bg: '#e8f5e9', text: '#2e7d32', label: '✅ อนุมัติแล้ว' },
            rejected: { bg: '#ffebee', text: '#c62828', label: '❌ ส่งกลับแก้ไข' },
        };
        const s = styles[status] || styles.submitted;
        return (
            <span style={{ background: s.bg, color: s.text, padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                {s.label}
            </span>
        );
    };

    if (loading) {
        return <div className="loading">⏳ กำลังโหลด...</div>;
    }

    return (
        <div className="approval-page">
            <header className="page-header">
                <h1>📋 ตรวจสอบและอนุมัติรายงาน</h1>
                <p>จำนวนรายงานที่รอตรวจสอบ: <strong>{pendingReports.length}</strong> รายการ</p>
            </header>

            {/* Tabs */}
            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pending')}
                >
                    📥 รอตรวจสอบ ({pendingReports.length})
                </button>
                <button
                    className={`tab ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    📜 ประวัติ ({recentlyProcessed.length})
                </button>
            </div>

            {/* Pending Reports */}
            {activeTab === 'pending' && (
                <div className="report-list">
                    {pendingReports.length === 0 ? (
                        <div className="empty-state">
                            <span>🎉</span>
                            <p>ไม่มีรายงานที่รอตรวจสอบ</p>
                        </div>
                    ) : (
                        pendingReports.map((report) => (
                            <div key={report.id} className="report-card">
                                <div className="report-header">
                                    <div>
                                        <h3>{report.project.name}</h3>
                                        <p className="meta">
                                            📍 {report.project.province_name} | 👷 {report.inspector.full_name}
                                        </p>
                                    </div>
                                    <div className="header-actions">
                                        <Link href={`/reports/${report.id}`} className="view-link">
                                            🔍 ดูรายละเอียด
                                        </Link>
                                        {getStatusBadge(report.status)}
                                    </div>
                                </div>

                                <div className="report-body">
                                    <div className="info-row">
                                        <span>📅 วันที่รายงาน:</span>
                                        <strong>{formatDate(report.report_date)}</strong>
                                    </div>
                                    <div className="info-row">
                                        <span>🌤️ สภาพอากาศ:</span>
                                        <span>{report.weather}</span>
                                    </div>
                                    <div className="info-row">
                                        <span>👷 แรงงาน:</span>
                                        <span>{report.labor_count} คน</span>
                                    </div>
                                    {report.rejection_count > 0 && (
                                        <div className="info-row warning">
                                            <span>⚠️ ส่งกลับแก้ไขแล้ว:</span>
                                            <span>{report.rejection_count} ครั้ง</span>
                                        </div>
                                    )}
                                    {report.work_summary && (
                                        <div className="summary">
                                            <strong>สรุปผลงาน:</strong>
                                            <p>{report.work_summary}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="report-actions">
                                    <button
                                        className="btn btn-approve"
                                        onClick={() => handleApprove(report)}
                                        disabled={processing}
                                    >
                                        ✅ อนุมัติ
                                    </button>
                                    <button
                                        className="btn btn-reject"
                                        onClick={() => {
                                            setSelectedReport(report);
                                            setShowRejectModal(true);
                                        }}
                                        disabled={processing}
                                    >
                                        ↩️ ส่งกลับแก้ไข
                                    </button>
                                    <button className="btn btn-view">
                                        👁️ ดูรายละเอียด
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* History */}
            {activeTab === 'history' && (
                <div className="report-list">
                    {recentlyProcessed.map((report) => (
                        <div key={report.id} className="report-card history">
                            <div className="report-header">
                                <div>
                                    <h3>{report.project.name}</h3>
                                    <p className="meta">
                                        📅 {formatDate(report.report_date)} | 👷 {report.inspector.full_name}
                                    </p>
                                </div>
                                {getStatusBadge(report.status)}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && selectedReport && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>↩️ ส่งกลับแก้ไข</h2>
                        <p>โครงการ: <strong>{selectedReport.project.name}</strong></p>
                        <p>วันที่: {formatDate(selectedReport.report_date)}</p>

                        <label>
                            เหตุผลในการส่งกลับ:
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                rows={4}
                                placeholder="ระบุเหตุผลที่ต้องแก้ไข..."
                            />
                        </label>

                        <div className="modal-actions">
                            <button
                                className="btn btn-cancel"
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectReason('');
                                }}
                            >
                                ยกเลิก
                            </button>
                            <button
                                className="btn btn-reject"
                                onClick={handleReject}
                                disabled={processing || !rejectReason.trim()}
                            >
                                {processing ? '⏳ กำลังส่ง...' : '📨 ส่งกลับแก้ไข'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .approval-page {
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 24px;
                    font-family: system-ui, sans-serif;
                }
                .page-header { text-align: center; margin-bottom: 24px; }
                .page-header h1 { color: #1a237e; margin: 0; }
                .tabs { display: flex; gap: 8px; margin-bottom: 20px; }
                .tab {
                    flex: 1;
                    padding: 12px;
                    border: 2px solid #e0e0e0;
                    background: white;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                }
                .tab.active { border-color: #1976d2; background: #e3f2fd; color: #1976d2; }
                .report-list { display: flex; flex-direction: column; gap: 16px; }
                .report-card {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                    overflow: hidden;
                }
                .report-card.history { opacity: 0.7; }
                .report-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    padding: 16px;
                    border-bottom: 1px solid #f0f0f0;
                }
                .header-actions {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 8px;
                }
                .view-link {
                    font-size: 13px;
                    color: #2563eb;
                    text-decoration: none;
                    background: #eff6ff;
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-weight: 500;
                }
                .view-link:hover { background: #dbeafe; }
                .report-header h3 { margin: 0; font-size: 16px; }
                .meta { margin: 4px 0 0; font-size: 13px; color: #666; }
                .report-body { padding: 16px; }
                .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
                .info-row.warning { color: #ef6c00; }
                .summary { margin-top: 12px; padding: 12px; background: #f5f5f5; border-radius: 6px; }
                .summary strong { display: block; margin-bottom: 4px; }
                .summary p { margin: 0; font-size: 14px; }
                .report-actions { display: flex; gap: 8px; padding: 16px; border-top: 1px solid #f0f0f0; }
                .btn {
                    flex: 1;
                    padding: 10px 16px;
                    border: none;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                }
                .btn-approve { background: #4caf50; color: white; }
                .btn-reject { background: #ff5722; color: white; }
                .btn-view { background: #e0e0e0; color: #333; }
                .btn-cancel { background: #9e9e9e; color: white; }
                .btn:disabled { opacity: 0.6; cursor: not-allowed; }
                .empty-state { text-align: center; padding: 60px; color: #666; }
                .empty-state span { font-size: 48px; }
                .modal-overlay {
                    position: fixed; inset: 0;
                    background: rgba(0,0,0,0.5);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 1000;
                }
                .modal {
                    background: white;
                    padding: 24px;
                    border-radius: 12px;
                    width: 90%;
                    max-width: 500px;
                }
                .modal h2 { margin: 0 0 16px; }
                .modal label { display: block; margin-top: 16px; }
                .modal textarea {
                    width: 100%; margin-top: 8px;
                    padding: 12px; border: 2px solid #e0e0e0;
                    border-radius: 8px; font-size: 14px;
                }
                .modal-actions { display: flex; gap: 12px; margin-top: 20px; }
                .loading { text-align: center; padding: 60px; font-size: 18px; }
            `}</style>
        </div>
    );
}
