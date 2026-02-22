-- ===========================================
-- 1. สร้างตาราง Monthly Reports สำหรับเก็บสถานะรายงานที่ Finalize แล้ว
-- ===========================================
CREATE TABLE IF NOT EXISTS monthly_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    report_year INTEGER NOT NULL,
    report_month INTEGER NOT NULL,
    total_progress DECIMAL(5, 2) NOT NULL,
    monthly_progress DECIMAL(5, 2) NOT NULL,
    status TEXT DEFAULT 'finalized',
    pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(project_id, report_year, report_month)
);
-- RLS Policies สำหรับ monthly_reports
ALTER TABLE monthly_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view monthly reports in their projects" ON monthly_reports FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM projects p
            WHERE p.id = monthly_reports.project_id
        )
    );
CREATE POLICY "Admins/Inspectors can create monthly reports" ON monthly_reports FOR
INSERT WITH CHECK (
        EXISTS (
            SELECT 1
            FROM users u
            WHERE u.id = auth.uid()
                AND (
                    u.role = 'admin'
                    OR u.role = 'inspector'
                )
        )
    );
-- ===========================================
-- 2. ตั้งค่า Storage Bucket สำหรับ Monthly Reports
-- ===========================================
-- หมายเหตุ: การสร้าง Bucket ต้องทำผ่าน Supabase Console หรือ Storage API
-- แต่เราสามารถตั้งค่า RLS สำหรับ Bucket ชื่อ 'monthly_reports' รอไว้ได้
-- สิทธิ์ในการอ่านไฟล์ PDF
CREATE POLICY "Public Access to Monthly Reports" ON storage.objects FOR
SELECT USING (bucket_id = 'monthly_reports');
-- สิทธิ์ในการอัปโหลดไฟล์ PDF (เฉพาะ Admin/Inspector)
CREATE POLICY "Admin/Inspector can upload Monthly Reports" ON storage.objects FOR
INSERT WITH CHECK (
        bucket_id = 'monthly_reports'
        AND (
            EXISTS (
                SELECT 1
                FROM public.users u
                WHERE u.id = auth.uid()
                    AND (
                        u.role = 'admin'
                        OR u.role = 'inspector'
                    )
            )
        )
    );