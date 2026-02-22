import { getSupabase } from './supabase';

// ประเภทข้อมูลสำหรับ Work Item
export interface WorkItem {
    id?: string;
    task_name: string;
    unit: string;
    planned_quantity: number;
    actual_quantity: number;
    progress_percent: number;
    weight: number;
    is_completed: boolean;
    notes?: string;
    milestone_id?: string;
}

// ประเภทข้อมูลสำหรับ Daily Report
export interface DailyReport {
    id: string;
    project_id: string;
    report_date: string;
    weather: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
    temperature?: number;
    humidity?: number;
    work_summary?: string;
    issues?: string;
    labor_count: number;
    equipment_notes?: string;
    inspector_id?: string;
    status: 'draft' | 'submitted' | 'approved' | 'rejected';
    work_items?: WorkItem[];
}

// ประเภทข้อมูลสำหรับ Carry Forward
export interface CarryForwardData {
    laborCount: number;
    workItems: Omit<WorkItem, 'id'>[];
    lastReportDate: string;
}

/**
 * ดึงรายงานล่าสุดของโครงการ
 * @param projectId - ID ของโครงการ
 * @returns รายงานล่าสุดพร้อม work items หรือ null
 */
export async function getLatestReport(projectId: string): Promise<DailyReport | null> {
    const supabase = getSupabase();

    const { data, error } = await supabase
        .from('daily_reports')
        .select(`
      *,
      work_items(*)
    `)
        .eq('project_id', projectId)
        .order('report_date', { ascending: false })
        .limit(1)
        .single();

    if (error || !data) {
        console.log('ไม่พบรายงานก่อนหน้า:', error?.message);
        return null;
    }

    return data as DailyReport;
}

/**
 * Smart Carry-Forward: ดึงข้อมูลจากรายงานล่าสุดมา Pre-fill
 * - กรองเฉพาะงานที่ยังไม่เสร็จ (progress < 100%)
 * - ดึงจำนวนแรงงานจากวันก่อน
 * @param projectId - ID ของโครงการ
 * @returns ข้อมูลสำหรับ Pre-fill หรือ null
 */
export async function carryForward(projectId: string): Promise<CarryForwardData | null> {
    const lastReport = await getLatestReport(projectId);

    if (!lastReport) {
        return null;
    }

    // กรองเฉพาะงานที่ยังไม่เสร็จ (progress < 100%)
    const incompleteItems = (lastReport.work_items || [])
        .filter(item => item.progress_percent < 100)
        .map(item => ({
            task_name: item.task_name,
            unit: item.unit,
            planned_quantity: item.planned_quantity,
            actual_quantity: item.actual_quantity,
            progress_percent: item.progress_percent,
            weight: item.weight || 1,
            is_completed: false,
            notes: item.notes,
            milestone_id: item.milestone_id,
        }));

    return {
        laborCount: lastReport.labor_count,
        workItems: incompleteItems,
        lastReportDate: lastReport.report_date,
    };
}

/**
 * คำนวณ Total Progress (Weighted Average) สำหรับ S-Curve
 * Formula: Σ(Progress_i × Weight_i) / Σ(Weight_i)
 * @param workItems - รายการงานทั้งหมด
 * @returns เปอร์เซ็นต์ความคืบหน้ารวม (0-100)
 */
export function calculateTotalProgress(workItems: WorkItem[]): number {
    if (!workItems || workItems.length === 0) {
        return 0;
    }

    const totalWeight = workItems.reduce((sum, item) => sum + (item.weight || 1), 0);

    if (totalWeight === 0) {
        return 0;
    }

    const weightedProgress = workItems.reduce(
        (sum, item) => sum + (item.progress_percent * (item.weight || 1)),
        0
    );

    return Math.round((weightedProgress / totalWeight) * 100) / 100;
}

/**
 * ตรวจสอบว่าวันนี้มีรายงานแล้วหรือยัง
 * @param projectId - ID ของโครงการ
 * @param date - วันที่ต้องการตรวจสอบ (YYYY-MM-DD)
 * @returns true ถ้ามีรายงานแล้ว
 */
export async function hasReportForDate(projectId: string, date: string): Promise<boolean> {
    const supabase = getSupabase();

    const { data } = await supabase
        .from('daily_reports')
        .select('id')
        .eq('project_id', projectId)
        .eq('report_date', date)
        .single();

    return !!data;
}

/**
 * สร้างรายงานใหม่พร้อม Work Items
 * @param report - ข้อมูลรายงาน
 * @param workItems - รายการงาน
 * @returns ID ของรายงานที่สร้าง หรือ null ถ้าล้มเหลว
 */
export async function createReport(
    report: Omit<DailyReport, 'id' | 'work_items'>,
    workItems: Omit<WorkItem, 'id'>[]
): Promise<string | null> {
    const supabase = getSupabase();

    // สร้างรายงานก่อน
    const { data: reportData, error: reportError } = await supabase
        .from('daily_reports')
        .insert({
            ...report,
            status: 'draft',
        })
        .select('id')
        .single();

    if (reportError || !reportData) {
        console.error('สร้างรายงานล้มเหลว:', reportError?.message);
        return null;
    }

    // สร้าง work items
    if (workItems.length > 0) {
        const itemsWithReportId = workItems.map(item => ({
            ...item,
            daily_report_id: reportData.id,
        }));

        const { error: itemsError } = await supabase
            .from('work_items')
            .insert(itemsWithReportId);

        if (itemsError) {
            console.error('สร้าง work items ล้มเหลว:', itemsError.message);
            // ยังคง return report id แม้ว่า items จะล้มเหลว
        }
    }

    return reportData.id;
}
