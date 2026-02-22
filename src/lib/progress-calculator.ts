/**
 * Progress Calculator สำหรับ PM Dashboard
 * ใช้สูตร Weighted Average ตามมาตรฐานงานวิศวกรรม
 * 
 * Formula: Progress = Σ(Actual_Qty × Weight) / Σ(Planned_Qty × Weight) × 100
 */

import { getSupabase } from './supabase';

// Interfaces
export interface WorkItem {
    task_name: string;
    unit: string;
    planned_quantity: number;
    actual_quantity: number;
    progress_percent: number;
    weight: number;
}

export interface Project {
    id: string;
    name: string;
    province_id: string;
    province_name?: string;
    budget: number;
    start_date: string;
    end_date: string;
    status: 'active' | 'completed' | 'suspended';
}

export interface ProjectProgress {
    project: Project;
    totalProgress: number;
    plannedProgress: number;
    variance: number; // ส่วนต่าง (บวก = เร็วกว่าแผน, ลบ = ช้ากว่าแผน)
    status: 'ahead' | 'on-track' | 'delayed' | 'critical';
    lastReportDate?: string;
    daysRemaining: number;
}

export interface ProvinceSummary {
    provinceId: string;
    provinceName: string;
    projectCount: number;
    avgProgress: number;
    totalBudget: number;
    delayedProjects: number;
    status: 'good' | 'warning' | 'critical';
}

export interface DashboardSummary {
    totalProjects: number;
    totalBudget: number;
    avgProgress: number;
    activeProjects: number;
    completedProjects: number;
    delayedProjects: number;
    criticalProjects: number;
}

/**
 * คำนวณ % ความคืบหน้าโครงการ (Weighted Average)
 * @param workItems รายการงานทั้งหมด
 * @returns เปอร์เซ็นต์ความคืบหน้า (0-100)
 */
export function calculateWeightedProgress(workItems: WorkItem[]): number {
    if (!workItems || workItems.length === 0) return 0;

    const totalWeight = workItems.reduce((sum, item) => sum + (item.weight || 1), 0);
    if (totalWeight === 0) return 0;

    const weightedSum = workItems.reduce(
        (sum, item) => sum + (item.progress_percent * (item.weight || 1)),
        0
    );

    return Math.round((weightedSum / totalWeight) * 100) / 100;
}

/**
 * คำนวณ % ตามแผน (Time-based Progress)
 * @param startDate วันที่เริ่มต้น
 * @param endDate วันที่สิ้นสุด
 * @param currentDate วันที่ปัจจุบัน
 * @returns เปอร์เซ็นต์ตามแผน (0-100)
 */
export function calculatePlannedProgress(
    startDate: string,
    endDate: string,
    currentDate: Date = new Date()
): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = currentDate;

    if (now <= start) return 0;
    if (now >= end) return 100;

    const totalDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    const elapsedDays = (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

    return Math.round((elapsedDays / totalDays) * 10000) / 100;
}

/**
 * คำนวณสถานะโครงการจาก Variance
 * @param variance ส่วนต่างระหว่าง actual และ planned
 * @returns สถานะโครงการ
 */
export function getProjectStatus(variance: number): 'ahead' | 'on-track' | 'delayed' | 'critical' {
    if (variance >= 5) return 'ahead';      // เร็วกว่าแผน 5%+
    if (variance >= -5) return 'on-track';  // อยู่ในแผน ±5%
    if (variance >= -15) return 'delayed';  // ล่าช้า 5-15%
    return 'critical';                       // ล่าช้ามาก 15%+
}

/**
 * ดึงข้อมูลความคืบหน้าทุกโครงการ
 */
export async function getAllProjectProgress(): Promise<ProjectProgress[]> {
    const supabase = getSupabase();

    // ดึงโครงการทั้งหมด
    const { data: projects, error: projectError } = await supabase
        .from('projects')
        .select(`
            *,
            provinces (name)
        `)
        .eq('status', 'active');

    if (projectError || !projects) {
        console.error('Error fetching projects:', projectError);
        return [];
    }

    const results: ProjectProgress[] = [];

    for (const project of projects) {
        // ดึง work items จากรายงานล่าสุด
        const { data: latestReport } = await supabase
            .from('daily_reports')
            .select(`
                report_date,
                work_items (*)
            `)
            .eq('project_id', project.id)
            .order('report_date', { ascending: false })
            .limit(1)
            .single();

        const workItems = latestReport?.work_items || [];
        const totalProgress = calculateWeightedProgress(workItems as WorkItem[]);
        const plannedProgress = calculatePlannedProgress(
            project.start_date,
            project.end_date
        );
        const variance = totalProgress - plannedProgress;
        const daysRemaining = Math.ceil(
            (new Date(project.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );

        results.push({
            project: {
                ...project,
                province_name: project.provinces?.name,
            },
            totalProgress,
            plannedProgress,
            variance,
            status: getProjectStatus(variance),
            lastReportDate: latestReport?.report_date,
            daysRemaining: Math.max(0, daysRemaining),
        });
    }

    return results;
}

/**
 * สรุปข้อมูลรายจังหวัด
 */
export async function getProvinceSummaries(): Promise<ProvinceSummary[]> {
    const allProgress = await getAllProjectProgress();

    // กลุ่มตามจังหวัด
    const provinceMap = new Map<string, ProjectProgress[]>();

    for (const progress of allProgress) {
        const provinceId = progress.project.province_id;
        if (!provinceMap.has(provinceId)) {
            provinceMap.set(provinceId, []);
        }
        provinceMap.get(provinceId)!.push(progress);
    }

    // สร้าง Summary แต่ละจังหวัด
    const summaries: ProvinceSummary[] = [];

    for (const [provinceId, projects] of Array.from(provinceMap.entries())) {
        const avgProgress = projects.reduce((sum: number, p: ProjectProgress) => sum + p.totalProgress, 0) / projects.length;
        const delayedProjects = projects.filter(
            (p: ProjectProgress) => p.status === 'delayed' || p.status === 'critical'
        ).length;
        const totalBudget = projects.reduce((sum: number, p: ProjectProgress) => sum + (p.project.budget || 0), 0);

        let status: 'good' | 'warning' | 'critical';
        if (delayedProjects === 0) {
            status = 'good';
        } else if (delayedProjects <= projects.length * 0.3) {
            status = 'warning';
        } else {
            status = 'critical';
        }

        summaries.push({
            provinceId,
            provinceName: projects[0]?.project.province_name || 'ไม่ระบุ',
            projectCount: projects.length,
            avgProgress: Math.round(avgProgress * 100) / 100,
            totalBudget,
            delayedProjects,
            status,
        });
    }

    // เรียงตามสถานะ (critical ก่อน)
    return summaries.sort((a, b) => {
        const order = { critical: 0, warning: 1, good: 2 };
        return order[a.status] - order[b.status];
    });
}

/**
 * สรุปภาพรวมทั้งหมด
 */
export async function getDashboardSummary(): Promise<DashboardSummary> {
    const supabase = getSupabase();

    // นับโครงการตามสถานะ
    const { data: projects } = await supabase
        .from('projects')
        .select('id, status, budget');

    if (!projects) {
        return {
            totalProjects: 0,
            totalBudget: 0,
            avgProgress: 0,
            activeProjects: 0,
            completedProjects: 0,
            delayedProjects: 0,
            criticalProjects: 0,
        };
    }

    const allProgress = await getAllProjectProgress();

    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const delayedProjects = allProgress.filter(p => p.status === 'delayed').length;
    const criticalProjects = allProgress.filter(p => p.status === 'critical').length;
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const avgProgress = allProgress.length > 0
        ? allProgress.reduce((sum, p) => sum + p.totalProgress, 0) / allProgress.length
        : 0;

    return {
        totalProjects: projects.length,
        totalBudget,
        avgProgress: Math.round(avgProgress * 100) / 100,
        activeProjects,
        completedProjects,
        delayedProjects,
        criticalProjects,
    };
}

/**
 * ดึงโครงการที่ล่าช้า (สำหรับ Alert)
 */
export async function getDelayedProjects(): Promise<ProjectProgress[]> {
    const allProgress = await getAllProjectProgress();
    return allProgress
        .filter(p => p.status === 'delayed' || p.status === 'critical')
        .sort((a, b) => a.variance - b.variance); // เรียงจากล่าช้ามากไปน้อย
}
