'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';
import { ArcFoundationCheck, ArcFoundationDesign, Project } from '@/types/database';
import { AlertCircle, CheckCircle2, Clock, RefreshCw, ArrowLeft, FileText } from 'lucide-react';

// Extended type to include joined data for the dashboard
type CheckWithDetails = ArcFoundationCheck & {
    foundation_design: ArcFoundationDesign & {
        project: Project;
    };
};

export default function FoundationDashboard() {
    const [checks, setChecks] = useState<CheckWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);
            const supabase = getSupabase();

            // Fetch all foundation checks with their related design and project info
            const { data, error: fetchError } = await supabase
                .from('arc_foundation_checks')
                .select(`
                    *,
                    foundation_design:arc_foundation_designs (
                        *,
                        project:projects (*)
                    )
                `)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;

            setChecks(data as unknown as CheckWithDetails[]);
        } catch (err: any) {
            console.error('Error fetching foundation checks:', err);
            setError(err.message || 'ไม่สามารถโหลดข้อมูลการตรวจสอบฐานรากได้');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Calculate summary statistics
    const totalChecks = checks.length;
    const passedChecks = checks.filter(c => c.status === 'pass').length;
    const failedChecks = checks.filter(c => c.status === 'fail').length;
    const pendingChecks = checks.filter(c => c.status === 'pending').length;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pass':
                return <span className="badge badge-success flex items-center gap-1"><CheckCircle2 size={12} /> ผ่านเกณฑ์</span>;
            case 'fail':
                return <span className="badge badge-danger flex items-center gap-1"><AlertCircle size={12} /> ไม่ผ่าน</span>;
            default:
                return <span className="badge badge-warning flex items-center gap-1"><Clock size={12} /> รอตรวจสอบ</span>;
        }
    };

    const formatNumber = (num?: number) => {
        return num !== undefined && num !== null ? num.toFixed(2) : '-';
    };

    return (
        <div className="p-4 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/arc" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={20} className="text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">🏗️ รายงานตรวจสอบฐานราก</h1>
                        <p className="text-sm text-gray-500">กฎกระทรวงฯ พ.ศ. 2566 (ARC)</p>
                    </div>
                </div>
                <button 
                    onClick={fetchDashboardData}
                    disabled={loading}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors disabled:opacity-50"
                >
                    <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-start gap-2">
                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3">
                <div className="card bg-white p-4 border-l-4 border-l-blue-500">
                    <p className="text-xs text-gray-500 font-medium">ฐานรากทั้งหมด</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{totalChecks}</p>
                </div>
                <div className="card bg-white p-4 border-l-4 border-l-green-500">
                    <p className="text-xs text-gray-500 font-medium">ผ่านเกณฑ์ (Pass)</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{passedChecks}</p>
                </div>
                <div className="card bg-white p-4 border-l-4 border-l-red-500">
                    <p className="text-xs text-gray-500 font-medium">ไม่ผ่าน (Fail)</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">{failedChecks}</p>
                </div>
                <div className="card bg-white p-4 border-l-4 border-l-yellow-500">
                    <p className="text-xs text-gray-500 font-medium">รอตรวจสอบ</p>
                    <p className="text-2xl font-bold text-yellow-600 mt-1">{pendingChecks}</p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
                <button className="btn btn-primary flex-1 flex justify-center items-center gap-2">
                    <FileText size={18} />
                    <span>เพิ่มข้อมูลฐานรากใหม่</span>
                </button>
            </div>

            {/* Checks List */}
            <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    รายการตรวจสอบล่าสุด
                </h2>
                
                {loading && checks.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-blue-500" />
                        <p>กำลังโหลดข้อมูล...</p>
                    </div>
                ) : checks.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-gray-500">ยังไม่มีข้อมูลการตรวจสอบฐานราก</p>
                    </div>
                ) : (
                    checks.map((check) => (
                        <div key={check.id} className="card bg-white overflow-hidden">
                            {/* Card Header */}
                            <div className="p-3 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-gray-900 text-lg">
                                            {check.foundation_design?.foundation_name || 'ไม่ระบุชื่อ'}
                                        </h3>
                                        <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full">
                                            {check.foundation_design?.foundation_type === 'pile' ? 'เสาเข็ม' : 'ฐานแผ่'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                                        โครงการ: {check.foundation_design?.project?.name || 'ไม่ระบุโครงการ'}
                                    </p>
                                </div>
                                {getStatusBadge(check.status)}
                            </div>

                            {/* Card Body - Metrics */}
                            <div className="p-3 space-y-3">
                                {/* Factor of Safety Grid */}
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Factor of Safety (FoS)</p>
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        <div className="bg-gray-50 p-2 rounded-lg">
                                            <p className="text-[10px] text-gray-500 mb-1">Bearing (≥3.0)</p>
                                            <p className={`font-bold ${check.fos_bearing && check.fos_bearing < 3.0 ? 'text-red-600' : 'text-gray-900'}`}>
                                                {formatNumber(check.fos_bearing)}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 p-2 rounded-lg">
                                            <p className="text-[10px] text-gray-500 mb-1">Sliding (≥1.5)</p>
                                            <p className={`font-bold ${check.fos_sliding && check.fos_sliding < 1.5 ? 'text-red-600' : 'text-gray-900'}`}>
                                                {formatNumber(check.fos_sliding)}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 p-2 rounded-lg">
                                            <p className="text-[10px] text-gray-500 mb-1">Overturn (≥2.0)</p>
                                            <p className={`font-bold ${check.fos_overturning && check.fos_overturning < 2.0 ? 'text-red-600' : 'text-gray-900'}`}>
                                                {formatNumber(check.fos_overturning)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Geometric Checks */}
                                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-600">ความหนาฐานราก:</span>
                                        {check.is_thickness_passed ? 
                                            <span className="text-xs text-green-600 font-medium flex items-center"><CheckCircle2 size={12} className="mr-1"/> ผ่าน</span> : 
                                            <span className="text-xs text-red-600 font-medium flex items-center"><AlertCircle size={12} className="mr-1"/> ไม่ผ่าน</span>
                                        }
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-600">ระยะหุ้มคอนกรีต:</span>
                                        {check.is_cover_passed ? 
                                            <span className="text-xs text-green-600 font-medium flex items-center"><CheckCircle2 size={12} className="mr-1"/> ผ่าน</span> : 
                                            <span className="text-xs text-red-600 font-medium flex items-center"><AlertCircle size={12} className="mr-1"/> ไม่ผ่าน</span>
                                        }
                                    </div>
                                </div>

                                {/* Defect Report Alert */}
                                {check.status === 'fail' && check.defect_report && (
                                    <div className="mt-2 bg-red-50 border border-red-100 rounded-lg p-2">
                                        <p className="text-xs font-semibold text-red-800 mb-1 flex items-center gap-1">
                                            <AlertCircle size={12} /> ข้อบกพร่องที่พบ:
                                        </p>
                                        <ul className="text-[11px] text-red-700 list-disc list-inside pl-4 space-y-0.5">
                                            {Object.entries(check.defect_report).map(([key, value]) => (
                                                <li key={key}>{String(value)}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <style jsx>{`
                .card {
                    box-shadow: 0 2px 8px -2px rgba(0,0,0,0.05);
                    border: 1px solid #f3f4f6;
                    border-radius: 0.75rem;
                }
                .badge {
                    padding: 0.25rem 0.5rem;
                    border-radius: 9999px;
                    font-size: 0.7rem;
                    font-weight: 600;
                }
                .badge-success {
                    background-color: #dcfce7;
                    color: #166534;
                }
                .badge-danger {
                    background-color: #fee2e2;
                    color: #991b1b;
                }
                .badge-warning {
                    background-color: #fef9c3;
                    color: #854d0e;
                }
                .btn {
                    padding: 0.75rem 1rem;
                    border-radius: 0.5rem;
                    font-weight: 600;
                    font-size: 0.875rem;
                    transition: all 0.2s;
                }
                .btn-primary {
                    background-color: #2563eb;
                    color: white;
                }
                .btn-primary:hover {
                    background-color: #1d4ed8;
                }
            `}</style>
        </div>
    );
}
