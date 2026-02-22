-- Daily Field Report Database Schema
-- สำหรับ Supabase/PostgreSQL
-- ===========================================
-- CORE TABLES (6 Tables)
-- ===========================================
-- 1. provinces: รายชื่อจังหวัด
CREATE TABLE provinces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  -- เช่น 'BKK', 'CNX'
  region TEXT,
  -- ภาค เช่น 'ภาคกลาง', 'ภาคเหนือ'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 2. users: ผู้ใช้งานพร้อม Role
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'inspector')),
  province_id UUID REFERENCES provinces(id),
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- 3. projects: ข้อมูลโครงการ
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contract_number TEXT UNIQUE,
  province_id UUID NOT NULL REFERENCES provinces(id),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  start_date DATE,
  end_date DATE,
  budget DECIMAL(15, 2),
  -- งบประมาณ (บาท)
  contractor_name TEXT,
  -- ชื่อผู้รับจ้าง
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'suspended')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- 4. contract_milestones: งวดงานตามสัญญา (ต้องสร้างก่อน daily_reports/work_items)
CREATE TABLE contract_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  milestone_number INTEGER NOT NULL,
  -- งวดที่ 1, 2, 3...
  name TEXT NOT NULL,
  -- ชื่องวดงาน
  description TEXT,
  planned_start_date DATE,
  planned_end_date DATE,
  actual_start_date DATE,
  actual_end_date DATE,
  payment_amount DECIMAL(15, 2),
  -- ยอดเบิกจ่าย (บาท)
  payment_percent DECIMAL(5, 2),
  -- เปอร์เซ็นต์ของสัญญา
  status TEXT DEFAULT 'pending' CHECK (
    status IN ('pending', 'in_progress', 'completed', 'paid')
  ),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, milestone_number)
);
-- 5. daily_reports: รายงานรายวัน
CREATE TABLE daily_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  report_date DATE NOT NULL,
  weather TEXT CHECK (
    weather IN ('sunny', 'cloudy', 'rainy', 'stormy')
  ),
  temperature DECIMAL(4, 1),
  -- องศาเซลเซียส
  humidity INTEGER,
  -- เปอร์เซ็นต์ความชื้น
  work_summary TEXT,
  issues TEXT,
  labor_count INTEGER DEFAULT 0,
  equipment_notes TEXT,
  -- บันทึกเครื่องจักร/อุปกรณ์
  inspector_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'draft' CHECK (
    status IN ('draft', 'submitted', 'approved', 'rejected')
  ),
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, report_date)
);
-- 6. work_items: รายรายการงาน (พร้อม weight สำหรับ S-Curve)
CREATE TABLE work_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_report_id UUID NOT NULL REFERENCES daily_reports(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES contract_milestones(id) ON DELETE
  SET NULL,
    -- เชื่อมกับงวดงาน
    task_name TEXT NOT NULL,
    unit TEXT NOT NULL,
    -- เช่น 'ม.', 'ตร.ม.', 'ลบ.ม.'
    planned_quantity DECIMAL(15, 2) DEFAULT 0,
    actual_quantity DECIMAL(15, 2) DEFAULT 0,
    progress_percent DECIMAL(5, 2) DEFAULT 0 CHECK (
      progress_percent >= 0
      AND progress_percent <= 100
    ),
    weight DECIMAL(5, 2) DEFAULT 1,
    -- น้ำหนักสำหรับคำนวณ S-Curve
    is_completed BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 7. photos: รูปถ่ายพร้อม Metadata
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_report_id UUID NOT NULL REFERENCES daily_reports(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  -- ขนาดไฟล์ (bytes)
  caption TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  taken_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 8. audit_logs: บันทึกประวัติการแก้ไข (ป้องกันทุจริต)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  -- ชื่อตารางที่ถูกแก้ไข
  record_id UUID NOT NULL,
  -- ID ของ record ที่ถูกแก้ไข
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values JSONB,
  -- ค่าเดิม
  new_values JSONB,
  -- ค่าใหม่
  changed_by UUID REFERENCES users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);
-- 9. signatures: ลายเซ็นดิจิทัล
CREATE TABLE signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_report_id UUID NOT NULL REFERENCES daily_reports(id) ON DELETE CASCADE,
  signer_type TEXT NOT NULL CHECK (
    signer_type IN ('inspector', 'contractor', 'approver')
  ),
  signer_id UUID REFERENCES users(id),
  signer_name TEXT NOT NULL,
  signature_image_url TEXT,
  -- URL รูปลายเซ็น
  signed_at TIMESTAMPTZ DEFAULT NOW(),
  verification_code TEXT,
  -- รหัสยืนยัน
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- ===========================================
-- INDEXES สำหรับประสิทธิภาพ
-- ===========================================
CREATE INDEX idx_projects_province ON projects(province_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_daily_reports_project ON daily_reports(project_id);
CREATE INDEX idx_daily_reports_date ON daily_reports(report_date DESC);
CREATE INDEX idx_daily_reports_status ON daily_reports(status);
CREATE INDEX idx_work_items_report ON work_items(daily_report_id);
CREATE INDEX idx_photos_report ON photos(daily_report_id);
CREATE INDEX idx_milestones_project ON contract_milestones(project_id);
CREATE INDEX idx_audit_logs_table ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_changed_at ON audit_logs(changed_at DESC);
-- ===========================================
-- TRIGGERS สำหรับ Audit Logs อัตโนมัติ
-- ===========================================
-- Function สำหรับบันทึก audit log
CREATE OR REPLACE FUNCTION log_audit_changes() RETURNS TRIGGER AS $$ BEGIN IF TG_OP = 'INSERT' THEN
INSERT INTO audit_logs (
    table_name,
    record_id,
    action,
    new_values,
    changed_by
  )
VALUES (
    TG_TABLE_NAME,
    NEW.id,
    'INSERT',
    to_jsonb(NEW),
    auth.uid()
  );
RETURN NEW;
ELSIF TG_OP = 'UPDATE' THEN
INSERT INTO audit_logs (
    table_name,
    record_id,
    action,
    old_values,
    new_values,
    changed_by
  )
VALUES (
    TG_TABLE_NAME,
    NEW.id,
    'UPDATE',
    to_jsonb(OLD),
    to_jsonb(NEW),
    auth.uid()
  );
RETURN NEW;
ELSIF TG_OP = 'DELETE' THEN
INSERT INTO audit_logs (
    table_name,
    record_id,
    action,
    old_values,
    changed_by
  )
VALUES (
    TG_TABLE_NAME,
    OLD.id,
    'DELETE',
    to_jsonb(OLD),
    auth.uid()
  );
RETURN OLD;
END IF;
RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- สร้าง Triggers สำหรับตารางที่ต้องการ audit
CREATE TRIGGER audit_daily_reports
AFTER
INSERT
  OR
UPDATE
  OR DELETE ON daily_reports FOR EACH ROW EXECUTE FUNCTION log_audit_changes();
CREATE TRIGGER audit_work_items
AFTER
INSERT
  OR
UPDATE
  OR DELETE ON work_items FOR EACH ROW EXECUTE FUNCTION log_audit_changes();
-- ===========================================
-- SAMPLE DATA (77 จังหวัด)
-- ===========================================
INSERT INTO provinces (name, code, region)
VALUES ('กรุงเทพมหานคร', 'BKK', 'ภาคกลาง'),
  ('นนทบุรี', 'NBI', 'ภาคกลาง'),
  ('ปทุมธานี', 'PTE', 'ภาคกลาง'),
  ('สมุทรปราการ', 'SPK', 'ภาคกลาง'),
  ('เชียงใหม่', 'CNX', 'ภาคเหนือ'),
  ('เชียงราย', 'CEI', 'ภาคเหนือ'),
  ('ขอนแก่น', 'KKN', 'ภาคตะวันออกเฉียงเหนือ'),
  ('นครราชสีมา', 'NMA', 'ภาคตะวันออกเฉียงเหนือ'),
  ('ชลบุรี', 'CBI', 'ภาคตะวันออก'),
  ('ระยอง', 'RYG', 'ภาคตะวันออก'),
  ('ภูเก็ต', 'HKT', 'ภาคใต้'),
  ('สงขลา', 'SKA', 'ภาคใต้');
-- หมายเหตุ: เพิ่มจังหวัดที่เหลือตามต้องการ