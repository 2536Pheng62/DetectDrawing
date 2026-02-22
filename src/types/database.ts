// Types สำหรับ Database Tables
// ใช้ร่วมกันทั้ง Frontend และ Backend

export interface Province {
    id: string;
    name: string;
    code: string;
    region?: string;
    created_at: string;
}

export interface User {
    id: string;
    email: string;
    full_name: string;
    role: 'admin' | 'inspector';
    province_id?: string;
    phone?: string;
    avatar_url?: string;
    created_at: string;
    updated_at: string;
    // Joined data
    province?: Province;
}

export interface Project {
    id: string;
    name: string;
    contract_number?: string;
    province_id: string;
    latitude?: number;
    longitude?: number;
    start_date?: string;
    end_date?: string;
    budget?: number;
    contractor_name?: string;
    status: 'active' | 'completed' | 'suspended';
    created_by?: string;
    created_at: string;
    updated_at: string;
    // Joined data
    province?: Province;
    milestones?: ContractMilestone[];
}

export interface DailyReport {
    id: string;
    project_id: string;
    report_date: string;
    weather?: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
    temperature?: number;
    humidity?: number;
    work_summary?: string;
    issues?: string;
    labor_count: number;
    equipment_notes?: string;
    inspector_id?: string;
    status: 'draft' | 'submitted' | 'approved' | 'rejected';
    submitted_at?: string;
    approved_at?: string;
    approved_by?: string;
    rejection_reason?: string;
    rejection_count?: number;
    created_at: string;
    updated_at: string;
    // Joined data
    project?: Project;
    inspector?: User;
    work_items?: WorkItem[];
    photos?: Photo[];
    signatures?: Signature[];
}

export interface WorkItem {
    id: string;
    daily_report_id: string;
    milestone_id?: string;
    task_name: string;
    unit: string;
    planned_quantity: number;
    actual_quantity: number;
    progress_percent: number;
    weight: number;
    is_completed: boolean;
    notes?: string;
    created_at: string;
    // Joined data
    milestone?: ContractMilestone;
}

export interface Photo {
    id: string;
    daily_report_id: string;
    file_url: string;
    file_size?: number;
    caption?: string;
    latitude?: number;
    longitude?: number;
    taken_at?: string;
    created_at: string;
}

export interface ContractMilestone {
    id: string;
    project_id: string;
    milestone_number: number;
    name: string;
    description?: string;
    planned_start_date?: string;
    planned_end_date?: string;
    actual_start_date?: string;
    actual_end_date?: string;
    payment_amount?: number;
    payment_percent?: number;
    status: 'pending' | 'in_progress' | 'completed' | 'paid';
    created_at: string;
    updated_at: string;
}

export interface AuditLog {
    id: string;
    table_name: string;
    record_id: string;
    action: 'INSERT' | 'UPDATE' | 'DELETE';
    old_values?: Record<string, unknown>;
    new_values?: Record<string, unknown>;
    changed_by?: string;
    changed_at: string;
    ip_address?: string;
    user_agent?: string;
}

export interface Signature {
    id: string;
    daily_report_id: string;
    signer_type: 'inspector' | 'contractor' | 'approver';
    signer_id?: string;
    signer_name: string;
    signature_image_url?: string;
    signed_at: string;
    verification_code?: string;
    ip_address?: string;
    created_at: string;
}

// Weather labels ภาษาไทย
export const WEATHER_LABELS: Record<string, string> = {
    sunny: 'แดดจัด ☀️',
    cloudy: 'มีเมฆ ⛅',
    rainy: 'ฝนตก 🌧️',
    stormy: 'พายุ ⛈️',
};

// Status labels ภาษาไทย
export const REPORT_STATUS_LABELS: Record<string, string> = {
    draft: 'ร่าง',
    submitted: 'ส่งแล้ว',
    approved: 'อนุมัติ',
    rejected: 'ปฏิเสธ',
};

export const PROJECT_STATUS_LABELS: Record<string, string> = {
    active: 'กำลังดำเนินการ',
    completed: 'เสร็จสิ้น',
    suspended: 'ระงับชั่วคราว',
};

export const MILESTONE_STATUS_LABELS: Record<string, string> = {
    pending: 'รอดำเนินการ',
    in_progress: 'กำลังดำเนินการ',
    completed: 'เสร็จสิ้น',
    paid: 'เบิกจ่ายแล้ว',
};

// Common units ภาษาไทย
export const COMMON_UNITS = [
    { value: 'ม.', label: 'เมตร' },
    { value: 'ตร.ม.', label: 'ตารางเมตร' },
    { value: 'ลบ.ม.', label: 'ลูกบาศก์เมตร' },
    { value: 'กก.', label: 'กิโลกรัม' },
    { value: 'ตัน', label: 'ตัน' },
    { value: 'ชุด', label: 'ชุด' },
    { value: 'จุด', label: 'จุด' },
    { value: 'แห่ง', label: 'แห่ง' },
    { value: 'อัน', label: 'อัน' },
];

// ===========================================
// ARC FOUNDATION & SOIL TYPES (2023 Regulation)
// ===========================================

export interface ArcSoilReport {
    id: string;
    project_id: string;
    boring_hole_no: string;
    groundwater_level?: number;
    created_by?: string;
    created_at: string;
    updated_at: string;
    // Joined data
    project?: Project;
    layers?: ArcSoilLayer[];
}

export interface ArcSoilLayer {
    id: string;
    soil_report_id: string;
    depth_from: number;
    depth_to: number;
    soil_type: 'clay' | 'sand' | 'rock' | 'other';
    su_value?: number;
    n_value?: number;
    friction_angle?: number;
    unit_weight?: number;
    created_at: string;
    updated_at: string;
}

export interface ArcFoundationDesign {
    id: string;
    project_id: string;
    foundation_name: string;
    foundation_type: 'shallow' | 'pile';
    pile_type?: 'friction' | 'end_bearing';
    is_group_pile: boolean;
    width: number;
    length: number;
    thickness: number;
    concrete_cover_top: number;
    concrete_cover_edge: number;
    pile_diameter?: number;
    pile_length?: number;
    axial_load: number;
    shear_force: number;
    overturning_moment: number;
    created_by?: string;
    created_at: string;
    updated_at: string;
    // Joined data
    project?: Project;
    checks?: ArcFoundationCheck[];
}

export interface ArcFoundationCheck {
    id: string;
    foundation_design_id: string;
    soil_report_id?: string;
    calculated_bearing_capacity?: number;
    calculated_skin_friction?: number;
    fos_bearing?: number;
    fos_sliding?: number;
    fos_overturning?: number;
    is_thickness_passed?: boolean;
    is_cover_passed?: boolean;
    status: 'pending' | 'pass' | 'fail';
    defect_report?: Record<string, any>;
    checked_by?: string;
    created_at: string;
    updated_at: string;
    // Joined data
    foundation_design?: ArcFoundationDesign;
    soil_report?: ArcSoilReport;
}
