/**
 * Monthly Report Logic
 * สรุปผลรายเดือนแบบ Cumulative Sum ตามมาตรฐานงานวิศวกรรม
 */

import { getSupabase } from './supabase';

export interface MonthlyWorkSummary {
    milestone_id: string;
    task_name: string;
    unit: string;
    total_planned: number;
    total_actual: number;
    progress_percent: number;
    weight: number;
    daily_logs: {
        date: string;
        quantity: number;
    }[];
}

export interface MonthlyReportData {
    projectId: string;
    year: number;
    month: number;
    projectName: string;
    totalProgress: number;
    prevMonthProgress: number;
    monthlyProgress: number; // ความคืบหน้าที่เพิ่มขึ้นเฉพาะเดือนนี้
    workItems: MonthlyWorkSummary[];
    totalLabor: number;
    avgLaborPerDay: number;
    allIssues: { date: string; issue: string }[];
    photoCount: number;
}

/**
 * ดึงข้อมูลสรุปรายเดือน
 */
export async function getMonthlyReportData(
    projectId: string,
    year: number,
    month: number
): Promise<MonthlyReportData | null> {
    const supabase = getSupabase();

    // 1. ดึงข้อมูลโครงการ
    const { data: project } = await supabase
        .from('projects')
        .select('name')
        .eq('id', projectId)
        .single();

    if (!project) return null;

    // 2. ดึงรายงานรายวันทั้งหมดในเดือนนั้น (และเดือนก่อนๆ เพื่อหา Cumulative)
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

    // ดึงข้อมูลถึงสิ้นเดือนที่เลือก
    const { data: reports, error } = await supabase
        .from('daily_reports')
        .select(`
            id,
            report_date,
            labor_count,
            issues,
            work_items (*),
            photos (id)
        `)
        .eq('project_id', projectId)
        .lte('report_date', endDate)
        .order('report_date', { ascending: true });

    if (error || !reports) return null;

    // กรองเขพาะในเดือนนี้สำหรับสรุปเบื้องต้น
    const thisMonthReports = reports.filter(r => r.report_date >= startDate && r.report_date <= endDate);

    // 3. รวมสถิติแรงงานและปัญหา
    const totalLabor = thisMonthReports.reduce((sum, r) => sum + (r.labor_count || 0), 0);
    const avgLabor = thisMonthReports.length > 0 ? totalLabor / thisMonthReports.length : 0;
    const allIssues = thisMonthReports
        .filter(r => r.issues && r.issues !== '-' && r.issues !== 'ไม่มี')
        .map(r => ({ date: r.report_date, issue: r.issues! }));

    const photoCount = thisMonthReports.reduce((sum, r) => sum + (r.photos?.length || 0), 0);

    // 4. คำนวณ Cumulative Progress ของ Work Items
    // Map ตาม milestone_id + task_name
    const workMap = new Map<string, MonthlyWorkSummary>();

    // ประมวลผลรายงานทั้งหมดจนถึงสิ้นเดือนนี้
    reports.forEach(report => {
        const isThisMonth = report.report_date >= startDate && report.report_date <= endDate;

        report.work_items?.forEach((item: any) => {
            const key = item.milestone_id || item.task_name;

            if (!workMap.has(key)) {
                workMap.set(key, {
                    milestone_id: item.milestone_id || '',
                    task_name: item.task_name,
                    unit: item.unit,
                    total_planned: item.planned_quantity,
                    total_actual: 0,
                    progress_percent: 0,
                    weight: item.weight || 1,
                    daily_logs: []
                });
            }

            const summary = workMap.get(key)!;
            summary.total_actual += (item.actual_quantity || 0);

            if (isThisMonth && item.actual_quantity > 0) {
                summary.daily_logs.push({
                    date: report.report_date,
                    quantity: item.actual_quantity
                });
            }
        });
    });

    const workItems = Array.from(workMap.values()).map(item => ({
        ...item,
        progress_percent: item.total_planned > 0
            ? Math.round((item.total_actual / item.total_planned) * 10000) / 100
            : 100
    }));

    // 5. คำนวณ Total Weighted Progress
    const calculateTotal = (items: MonthlyWorkSummary[]) => {
        const totalWeight = items.reduce((sum, i) => sum + (i.weight || 1), 0);
        if (totalWeight === 0) return 0;
        const weightedSum = items.reduce((sum, i) => sum + (i.progress_percent * (i.weight || 1)), 0);
        return Math.round((weightedSum / totalWeight) * 100) / 100;
    };

    const totalProgress = calculateTotal(workItems);

    // หาความคืบหน้าเดือนก่อน
    const prevMonthItems = reports
        .filter(r => r.report_date < startDate)
        .reduce((map, r) => {
            r.work_items?.forEach((item: any) => {
                const key = item.milestone_id || item.task_name;
                map.set(key, (map.get(key) || 0) + (item.actual_quantity || 0));
            });
            return map;
        }, new Map<string, number>());

    const prevMonthWorkItems = workItems.map(item => {
        const actual = prevMonthItems.get(item.milestone_id || item.task_name) || 0;
        return {
            ...item,
            progress_percent: item.total_planned > 0
                ? Math.round((actual / item.total_planned) * 10000) / 100
                : 0
        };
    });

    const prevProgress = calculateTotal(prevMonthWorkItems);

    return {
        projectId,
        year,
        month,
        projectName: project.name,
        totalProgress: totalProgress,
        prevMonthProgress: prevProgress,
        monthlyProgress: Math.max(0, totalProgress - prevProgress),
        workItems,
        totalLabor,
        avgLaborPerDay: Math.round(avgLabor * 10) / 10,
        allIssues,
        photoCount
    };
}
