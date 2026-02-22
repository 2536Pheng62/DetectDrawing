/**
 * Notification System สำหรับ Approval Workflow
 * - แจ้งเตือนเมื่ออนุมัติ/ส่งกลับแก้ไข
 * - เก็บ log การแจ้งเตือนใน database
 */

import { getSupabase } from './supabase';

// Interfaces
interface NotificationPayload {
    userId: string;
    type: 'approval' | 'rejection' | 'reminder' | 'system';
    title: string;
    message: string;
    reportId?: string;
    projectId?: string;
}

interface Notification {
    id: string;
    user_id: string;
    type: string;
    title: string;
    message: string;
    report_id?: string;
    project_id?: string;
    is_read: boolean;
    created_at: string;
}

/**
 * สร้าง Notification ใหม่และบันทึกลง Database
 */
export async function createNotification(payload: NotificationPayload): Promise<boolean> {
    const supabase = getSupabase();

    const { error } = await supabase.from('notifications').insert({
        user_id: payload.userId,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        report_id: payload.reportId,
        project_id: payload.projectId,
        is_read: false,
    });

    if (error) {
        console.error('Failed to create notification:', error);
        return false;
    }

    return true;
}

/**
 * แจ้งเมื่ออนุมัติรายงาน
 */
export async function sendApprovalNotification(
    inspectorId: string,
    reportId: string,
    projectName: string,
    reportDate: string,
    approverName?: string
): Promise<boolean> {
    return createNotification({
        userId: inspectorId,
        type: 'approval',
        title: '✅ รายงานได้รับการอนุมัติ',
        message: `รายงานโครงการ "${projectName}" วันที่ ${new Date(reportDate).toLocaleDateString('th-TH')} ได้รับการอนุมัติแล้ว${approverName ? ` โดย ${approverName}` : ''}`,
        reportId,
    });
}

/**
 * แจ้งเมื่อส่งกลับแก้ไข (Reject)
 */
export async function sendRejectionNotification(
    inspectorId: string,
    reportId: string,
    projectName: string,
    reportDate: string,
    reason: string,
    reviewerName?: string
): Promise<boolean> {
    return createNotification({
        userId: inspectorId,
        type: 'rejection',
        title: '⚠️ รายงานถูกส่งกลับแก้ไข',
        message: `รายงานโครงการ "${projectName}" วันที่ ${new Date(reportDate).toLocaleDateString('th-TH')} ถูกส่งกลับเพื่อแก้ไข\n\nเหตุผล: ${reason}${reviewerName ? `\n\nโดย: ${reviewerName}` : ''}`,
        reportId,
    });
}

/**
 * ดึง notifications ของ user
 */
export async function getUserNotifications(
    userId: string,
    limit: number = 20
): Promise<Notification[]> {
    const supabase = getSupabase();

    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Failed to fetch notifications:', error);
        return [];
    }

    return data as Notification[];
}

/**
 * นับ unread notifications
 */
export async function getUnreadCount(userId: string): Promise<number> {
    const supabase = getSupabase();

    const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

    if (error) {
        console.error('Failed to count notifications:', error);
        return 0;
    }

    return count || 0;
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId: string): Promise<boolean> {
    const supabase = getSupabase();

    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

    return !error;
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(userId: string): Promise<boolean> {
    const supabase = getSupabase();

    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId);

    return !error;
}
