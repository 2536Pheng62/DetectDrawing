'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import { DailyReportForm, type WorkItemEntry, type PhotoEntry } from '@/components/DailyReportForm';
import { type Project, type ContractMilestone } from '@/types/database';

/**
 * หน้าสร้างรายงานประจำวันใหม่
 * - ดึงข้อมูลโครงการและรายการงาน
 * - จัดการการอัปโหลดรูปภาพไปยัง Supabase Storage
 * - บันทึกข้อมูลรายงานและรายการงาน
 */
export default function NewReportPage() {
    return (
        <Suspense fallback={<div>⏳ กำลังเตรียมความพร้อม...</div>}>
            <NewReportContent />
        </Suspense>
    );
}

function NewReportContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const projectId = searchParams.get('projectId');

    const [project, setProject] = useState<Project | null>(null);
    const [milestones, setMilestones] = useState<ContractMilestone[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (projectId) {
            loadProjectData(projectId);
        } else {
            setError('ไม่พบรหัสโครงการ');
            setLoading(false);
        }
    }, [projectId]);

    const loadProjectData = async (id: string) => {
        try {
            setLoading(true);
            const supabase = getSupabase();

            // 1. ดึงข้อมูลโครงการ
            const { data: projData, error: projError } = await supabase
                .from('projects')
                .select('*')
                .eq('id', id)
                .single();

            if (projError) throw projError;
            setProject(projData);

            // 2. ดึงรายการงาน (ใช้ milestones เป็นพื้นฐาน)
            const { data: mileData, error: mileError } = await supabase
                .from('contract_milestones')
                .select('*')
                .eq('project_id', id)
                .order('milestone_number', { ascending: true });

            if (mileError) throw mileError;
            setMilestones(mileData);

        } catch (err) {
            console.error('Error loading project data:', err);
            setError('ไม่สามารถดึงข้อมูลโครงการได้');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (formData: any, workItems: WorkItemEntry[], photos: PhotoEntry[]) => {
        try {
            const supabase = getSupabase();

            // 1. บันทึก Daily Report
            const { data: report, error: reportError } = await supabase
                .from('daily_reports')
                .insert({
                    project_id: projectId,
                    report_date: formData.reportDate,
                    weather: formData.weather,
                    temperature: formData.temperature,
                    humidity: formData.humidity,
                    work_summary: formData.workSummary,
                    issues: formData.issues,
                    labor_count: formData.laborCount,
                    equipment_notes: formData.equipmentNotes,
                    status: 'submitted', // ส่งเลย หรือจะบันทึกเป็น draft ก่อนก็ได้
                })
                .select()
                .single();

            if (reportError) throw reportError;

            // 2. บันทึก Work Items
            if (workItems.length > 0) {
                const itemsToInsert = workItems.map(item => ({
                    daily_report_id: report.id,
                    milestone_id: item.milestone_id,
                    task_name: item.task_name,
                    unit: item.unit,
                    planned_quantity: item.planned_quantity,
                    actual_quantity: item.actual_quantity,
                    progress_percent: (item.actual_quantity / item.planned_quantity) * 100, // คำนวณเบื้องต้น
                }));

                const { error: itemsError } = await supabase
                    .from('work_items')
                    .insert(itemsToInsert);

                if (itemsError) throw itemsError;
            }

            // 3. อัปโหลดและบันทึก Photos
            if (photos.length > 0 && project) {
                for (const photo of photos) {
                    const fileName = `${Date.now()}_${photo.file.name}`;
                    const storagePath = `${project.province_id}/${project.id}/${report.id}/${fileName}`;

                    const { data: uploadData, error: uploadError } = await supabase.storage
                        .from('photos')
                        .upload(storagePath, photo.file);

                    if (uploadError) throw uploadError;

                    const { data: urlData } = supabase.storage
                        .from('photos')
                        .getPublicUrl(storagePath);

                    await supabase.from('photos').insert({
                        daily_report_id: report.id,
                        file_url: urlData.publicUrl,
                        caption: photo.caption,
                        latitude: photo.latitude,
                        longitude: photo.longitude,
                        taken_at: new Date().toISOString(), // หรือจาก EXIF
                    });
                }
            }

            alert('บันทึกรายงานสำเร็จ');
            router.push(`/reports/${report.id}`);

        } catch (err) {
            console.error('Error submitting report:', err);
            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
    };

    if (loading) return <div className="loading">⏳ กำลังโหลดข้อมูลโครงการ...</div>;
    if (error) return <div className="error">⚠️ {error}</div>;
    if (!project) return <div className="error">⚠️ ไม่พบข้อมูลโครงการ</div>;

    // แปลง milestones เป็น WorkItemEntry
    const initialWorkItems: WorkItemEntry[] = milestones.map(m => ({
        milestone_id: m.id,
        task_name: m.name,
        unit: 'รายการ', // หรือดึงจาก db ถ้ามี
        planned_quantity: 1, // หรือจาก db
        actual_quantity: 0,
        weight: m.payment_percent || 1,
    }));

    return (
        <div className="new-report-page">
            <header className="page-header">
                <button className="back-btn" onClick={() => router.back()}>⬅️ ยกเลิก</button>
                <h1>เขียนรายงานใหม่</h1>
            </header>

            <DailyReportForm
                projectId={project.id}
                projectName={project.name}
                projectLat={project.latitude}
                projectLon={project.longitude}
                initialWorkItems={initialWorkItems}
                onSubmit={handleSubmit}
            />

            <style jsx>{`
                .new-report-page {
                    padding: 24px;
                    background: #f1f5f9;
                    min-height: 100vh;
                }
                .page-header {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    max-width: 700px;
                    margin: 0 auto 32px;
                }
                .page-header h1 { margin: 0; font-size: 20px; color: #1e293b; }
                .back-btn {
                    background: none; border: none; color: #64748b; font-weight: 600; cursor: pointer;
                }
                .loading, .error { text-align: center; padding: 100px; font-size: 18px; color: #64748b; }
            `}</style>
        </div>
    );
}
