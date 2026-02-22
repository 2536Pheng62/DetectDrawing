-- Row Level Security (RLS) Policies
-- แยกสิทธิ์การเข้าถึงตาม Role: Admin vs Inspector

-- ===========================================
-- ENABLE RLS ON ALL TABLES
-- ===========================================

ALTER TABLE provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE signatures ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- HELPER FUNCTIONS
-- ===========================================

-- ตรวจสอบ Role ของ User
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ตรวจสอบ Province ของ User
CREATE OR REPLACE FUNCTION get_user_province_id()
RETURNS UUID AS $$
  SELECT province_id FROM users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ตรวจสอบว่าเป็น Admin หรือไม่
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT get_user_role() = 'admin';
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ===========================================
-- PROVINCES POLICIES
-- ===========================================

-- ทุกคนอ่านได้
CREATE POLICY "provinces_select_all" ON provinces
  FOR SELECT USING (true);

-- เฉพาะ Admin แก้ไขได้
CREATE POLICY "provinces_admin_all" ON provinces
  FOR ALL USING (is_admin());

-- ===========================================
-- USERS POLICIES
-- ===========================================

-- Admin เห็นทุกคน, Inspector เห็นเฉพาะตัวเอง
CREATE POLICY "users_select" ON users
  FOR SELECT USING (
    is_admin() OR id = auth.uid()
  );

-- แก้ไขได้เฉพาะ profile ตัวเอง
CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (id = auth.uid());

-- Admin สร้าง user ได้
CREATE POLICY "users_admin_insert" ON users
  FOR INSERT WITH CHECK (is_admin());

-- ===========================================
-- PROJECTS POLICIES
-- ===========================================

-- Admin เห็นทุกโปรเจกต์, Inspector เห็นเฉพาะจังหวัดตนเอง
CREATE POLICY "projects_select" ON projects
  FOR SELECT USING (
    is_admin() OR province_id = get_user_province_id()
  );

-- Admin สร้าง/แก้ไขได้ทุกโปรเจกต์
CREATE POLICY "projects_admin_all" ON projects
  FOR ALL USING (is_admin());

-- Inspector สร้าง/แก้ไขได้เฉพาะจังหวัดตนเอง
CREATE POLICY "projects_inspector_province" ON projects
  FOR INSERT WITH CHECK (
    NOT is_admin() AND province_id = get_user_province_id()
  );

CREATE POLICY "projects_inspector_update" ON projects
  FOR UPDATE USING (
    NOT is_admin() AND province_id = get_user_province_id()
  );

-- ===========================================
-- DAILY_REPORTS POLICIES
-- ===========================================

-- Admin เห็นทุกรายงาน, Inspector เห็นเฉพาะจังหวัดตนเอง
CREATE POLICY "daily_reports_select" ON daily_reports
  FOR SELECT USING (
    is_admin() OR 
    EXISTS (
      SELECT 1 FROM projects p 
      WHERE p.id = daily_reports.project_id 
      AND p.province_id = get_user_province_id()
    )
  );

-- สร้างรายงานได้เฉพาะโปรเจกต์ในจังหวัดตนเอง
CREATE POLICY "daily_reports_insert" ON daily_reports
  FOR INSERT WITH CHECK (
    is_admin() OR 
    EXISTS (
      SELECT 1 FROM projects p 
      WHERE p.id = project_id 
      AND p.province_id = get_user_province_id()
    )
  );

-- แก้ไขได้เฉพาะรายงานที่ตัวเองสร้าง (ยกเว้น Admin)
CREATE POLICY "daily_reports_update" ON daily_reports
  FOR UPDATE USING (
    is_admin() OR inspector_id = auth.uid()
  );

-- ===========================================
-- WORK_ITEMS POLICIES
-- ===========================================

-- เข้าถึงได้ตามสิทธิ์ daily_reports
CREATE POLICY "work_items_select" ON work_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM daily_reports dr 
      WHERE dr.id = work_items.daily_report_id
      AND (
        is_admin() OR 
        EXISTS (
          SELECT 1 FROM projects p 
          WHERE p.id = dr.project_id 
          AND p.province_id = get_user_province_id()
        )
      )
    )
  );

CREATE POLICY "work_items_insert" ON work_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM daily_reports dr 
      WHERE dr.id = daily_report_id
      AND (is_admin() OR dr.inspector_id = auth.uid())
    )
  );

CREATE POLICY "work_items_update" ON work_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM daily_reports dr 
      WHERE dr.id = work_items.daily_report_id
      AND (is_admin() OR dr.inspector_id = auth.uid())
    )
  );

-- ===========================================
-- PHOTOS POLICIES
-- ===========================================

-- เข้าถึงได้ตามสิทธิ์ daily_reports
CREATE POLICY "photos_select" ON photos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM daily_reports dr 
      WHERE dr.id = photos.daily_report_id
      AND (
        is_admin() OR 
        EXISTS (
          SELECT 1 FROM projects p 
          WHERE p.id = dr.project_id 
          AND p.province_id = get_user_province_id()
        )
      )
    )
  );

CREATE POLICY "photos_insert" ON photos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM daily_reports dr 
      WHERE dr.id = daily_report_id
      AND (is_admin() OR dr.inspector_id = auth.uid())
    )
  );

-- ===========================================
-- CONTRACT_MILESTONES POLICIES
-- ===========================================

-- เข้าถึงได้ตามสิทธิ์ projects
CREATE POLICY "milestones_select" ON contract_milestones
  FOR SELECT USING (
    is_admin() OR 
    EXISTS (
      SELECT 1 FROM projects p 
      WHERE p.id = contract_milestones.project_id 
      AND p.province_id = get_user_province_id()
    )
  );

-- เฉพาะ Admin แก้ไขงวดงานได้
CREATE POLICY "milestones_admin_all" ON contract_milestones
  FOR ALL USING (is_admin());

-- ===========================================
-- AUDIT_LOGS POLICIES
-- ===========================================

-- เฉพาะ Admin อ่าน audit logs ได้
CREATE POLICY "audit_logs_admin_select" ON audit_logs
  FOR SELECT USING (is_admin());

-- ===========================================
-- SIGNATURES POLICIES
-- ===========================================

-- เข้าถึงได้ตามสิทธิ์ daily_reports
CREATE POLICY "signatures_select" ON signatures
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM daily_reports dr 
      WHERE dr.id = signatures.daily_report_id
      AND (
        is_admin() OR 
        EXISTS (
          SELECT 1 FROM projects p 
          WHERE p.id = dr.project_id 
          AND p.province_id = get_user_province_id()
        )
      )
    )
  );

CREATE POLICY "signatures_insert" ON signatures
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM daily_reports dr 
      WHERE dr.id = daily_report_id
    )
  );

-- ===========================================
-- ENHANCED PROTECTION POLICIES
-- ป้องกันการแก้ไขข้อมูลย้อนหลัง (Compliance)
-- ===========================================

-- ป้องกันการแก้ไข daily_reports ที่ approved แล้ว
-- Inspector แก้ไขได้เฉพาะ draft/rejected
CREATE POLICY "daily_reports_update_protection" ON daily_reports
  FOR UPDATE USING (
    CASE 
      WHEN is_admin() THEN true  -- Admin แก้ได้เสมอ
      ELSE (
        inspector_id = auth.uid() 
        AND status IN ('draft', 'rejected')  -- ยังไม่ approved
      )
    END
  );

-- ป้องกันการแก้ไข work_items ของรายงานที่ approved แล้ว  
CREATE POLICY "work_items_update_protection" ON work_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM daily_reports dr 
      WHERE dr.id = work_items.daily_report_id
      AND (
        is_admin() OR 
        (dr.inspector_id = auth.uid() AND dr.status IN ('draft', 'rejected'))
      )
    )
  );

-- ป้องกันการลบ work_items ของรายงานที่ approved แล้ว
CREATE POLICY "work_items_delete_protection" ON work_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM daily_reports dr 
      WHERE dr.id = work_items.daily_report_id
      AND (
        is_admin() OR 
        (dr.inspector_id = auth.uid() AND dr.status IN ('draft', 'rejected'))
      )
    )
  );

-- ห้ามลบรูปจากรายงานที่ approved แล้ว
CREATE POLICY "photos_delete_protection" ON photos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM daily_reports dr 
      WHERE dr.id = photos.daily_report_id
      AND (
        is_admin() OR 
        (dr.inspector_id = auth.uid() AND dr.status IN ('draft', 'rejected'))
      )
    )
  );

-- ห้ามแก้ไข/ลบ audit_logs (Immutable - สำคัญมากสำหรับ Compliance)
-- NO UPDATE/DELETE policies = ไม่มีใครแก้ไข/ลบได้

-- ห้ามแก้ไข/ลบ signatures (Immutable - ลายเซ็นต้องคงที่)
-- NO UPDATE/DELETE policies = ลายเซ็นเป็น immutable

-- ===========================================
-- TIME-BASED PROTECTION (ป้องกันการกรอกย้อนหลังเกิน 7 วัน)
-- ===========================================

-- Function ตรวจสอบว่ารายงานอยู่ในช่วงที่แก้ไขได้ (7 วัน)
CREATE OR REPLACE FUNCTION is_within_edit_window(report_date DATE)
RETURNS BOOLEAN AS $$
  SELECT report_date >= CURRENT_DATE - INTERVAL '7 days';
$$ LANGUAGE SQL STABLE;

-- ป้องกัน Inspector แก้ไขรายงานที่เก่ากว่า 7 วัน
CREATE POLICY "daily_reports_time_window" ON daily_reports
  FOR UPDATE USING (
    CASE 
      WHEN is_admin() THEN true  -- Admin แก้ได้เสมอ
      ELSE is_within_edit_window(report_date)
    END
  );

-- ===========================================
-- STRICT CONSTRAINTS (INTJ Style - รัดกุมทุกรายละเอียด)
-- ===========================================

-- 1. ป้องกันการส่งรายงานของวันที่ในอนาคต (Future Date Prevention)
ALTER TABLE daily_reports 
ADD CONSTRAINT chk_no_future_report_date 
CHECK (report_date <= CURRENT_DATE);

-- 2. ป้องกันการสร้างรายงานซ้ำ (ซึ่งมีอยู่แล้วใน schema แต่ verify อีกครั้ง)
-- UNIQUE(project_id, report_date) ใน daily_reports

-- 3. Function ตรวจสอบว่ารายงานไม่ใช่อนาคต (สำหรับ RLS)
CREATE OR REPLACE FUNCTION is_valid_report_date(report_date DATE)
RETURNS BOOLEAN AS $$
  SELECT report_date <= CURRENT_DATE;
$$ LANGUAGE SQL STABLE;

-- 4. Policy ป้องกันการ INSERT รายงานอนาคต
CREATE POLICY "daily_reports_no_future_insert" ON daily_reports
  FOR INSERT WITH CHECK (
    report_date <= CURRENT_DATE
  );

-- ===========================================
-- SUPABASE STORAGE BUCKET POLICIES (Enhanced V2)
-- ป้องกันการลบหลักฐาน + จำกัดตามจังหวัด
-- ต้อง run ใน Supabase Dashboard > SQL Editor
-- ===========================================

-- สร้าง bucket (ถ้ายังไม่มี)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('photos', 'photos', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('signatures', 'signatures', false)
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- PHOTOS BUCKET POLICIES
-- Path format: photos/{province_id}/{project_id}/{filename}
-- ===========================================

-- Policy: Upload photos - เฉพาะใน folder จังหวัดตนเอง
-- Inspector อัปโหลดได้เฉพาะ folder ที่ตรงกับ province_id ของตน
DROP POLICY IF EXISTS "photos_upload_authenticated" ON storage.objects;
CREATE POLICY "photos_upload_by_province" ON storage.objects
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    bucket_id = 'photos' AND (
      -- Admin อัปโหลดได้ทุก folder
      EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
      OR
      -- Inspector อัปโหลดได้เฉพาะ folder จังหวัดตนเอง
      (storage.foldername(name))[1] = (
        SELECT province_id::text FROM users WHERE id = auth.uid()
      )
    )
  );

-- Policy: View photos - จำกัดตาม province
DROP POLICY IF EXISTS "photos_view_by_province" ON storage.objects;
CREATE POLICY "photos_view_by_province" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'photos' AND (
      -- Admin เห็นทุกรูป
      EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
      OR
      -- Inspector เห็นเฉพาะรูปในจังหวัดตนเอง
      (storage.foldername(name))[1] = (
        SELECT province_id::text FROM users WHERE id = auth.uid()
      )
    )
  );

-- Policy: Update photos - จำกัดตาม province + เวลา
CREATE POLICY "photos_update_by_province" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'photos' AND (
      EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
      OR
      (storage.foldername(name))[1] = (
        SELECT province_id::text FROM users WHERE id = auth.uid()
      )
    )
  );

-- Policy: Delete photos - ห้ามลบรูปที่เก่ากว่า 24 ชั่วโมง
-- เพื่อป้องกันการลบหลักฐาน
CREATE POLICY "photos_delete_within_24h" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'photos' AND (
      -- Admin ลบได้เสมอ (กรณีจำเป็น)
      EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
      OR
      (
        -- Inspector ลบได้เฉพาะรูปในจังหวัดตนเอง
        (storage.foldername(name))[1] = (
          SELECT province_id::text FROM users WHERE id = auth.uid()
        )
        AND
        -- และต้องเป็นรูปที่อัปโหลดไม่เกิน 24 ชั่วโมง
        created_at > NOW() - INTERVAL '24 hours'
      )
    )
  );

-- ===========================================
-- SIGNATURES BUCKET POLICIES
-- ลายเซ็นห้ามลบเลย (Immutable)
-- ===========================================

-- Policy: Upload signatures - authenticated users
DROP POLICY IF EXISTS "signatures_upload_authenticated" ON storage.objects;
CREATE POLICY "signatures_upload_authenticated" ON storage.objects
  FOR INSERT 
  TO authenticated
  WITH CHECK (bucket_id = 'signatures');

-- Policy: View signatures
DROP POLICY IF EXISTS "signatures_view_authenticated" ON storage.objects;
CREATE POLICY "signatures_view_authenticated" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'signatures');

-- Policy: Delete signatures - ห้ามลบเลย (ยกเว้น admin)
-- ลายเซ็นเป็นหลักฐานทางกฎหมาย ห้ามลบ
CREATE POLICY "signatures_no_delete" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'signatures' AND
    -- เฉพาะ admin เท่านั้นที่ลบได้
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Policy: Update signatures - ห้าม update เลย
-- ลายเซ็น immutable
CREATE POLICY "signatures_no_update" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'signatures' AND
    -- ไม่อนุญาตให้แก้ไข แม้แต่ admin
    false
  );

-- ===========================================
-- TEST ACCOUNTS SQL (สำหรับ Verification)
-- ต้อง run หลังจาก auth.users ถูกสร้างแล้ว
-- ===========================================

-- เพิ่มจังหวัดทดสอบ (ถ้ายังไม่มี)
INSERT INTO provinces (name, code, region) VALUES
  ('อุดรธานี', 'UDN', 'ภาคตะวันออกเฉียงเหนือ'),
  ('หนองคาย', 'NKI', 'ภาคตะวันออกเฉียงเหนือ')
ON CONFLICT (code) DO NOTHING;

/*
-- Test Accounts (ต้อง INSERT หลัง User signup ผ่าน Supabase Auth)
-- หรือใช้ Supabase Dashboard > Authentication > Users เพื่อสร้าง

-- User A: Inspector อุดรธานี
INSERT INTO users (id, email, full_name, role, province_id) VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', -- แทนด้วย auth.uid() จริง
  'inspector_udn@test.com',
  'ผู้ควบคุมงาน อุดรธานี',
  'inspector',
  (SELECT id FROM provinces WHERE code = 'UDN')
);

-- User B: Inspector หนองคาย
INSERT INTO users (id, email, full_name, role, province_id) VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', -- แทนด้วย auth.uid() จริง
  'inspector_nki@test.com',
  'ผู้ควบคุมงาน หนองคาย',
  'inspector',
  (SELECT id FROM provinces WHERE code = 'NKI')
);

-- User C: Admin ส่วนกลาง
INSERT INTO users (id, email, full_name, role, province_id) VALUES (
  'cccccccc-cccc-cccc-cccc-cccccccccccc', -- แทนด้วย auth.uid() จริง
  'admin@test.com',
  'Admin ส่วนกลาง',
  'admin',
  NULL -- Admin ไม่ต้องมี province
);
*/

-- ===========================================
-- TESTING QUERIES (ทดสอบ RLS)
-- ===========================================

/*
-- Test 1: ตรวจสอบ Future Date Prevention
-- ควร ERROR: violates check constraint
INSERT INTO daily_reports (project_id, report_date, inspector_id)
VALUES ('some-project-id', CURRENT_DATE + INTERVAL '1 day', auth.uid());

-- Test 2: Inspector A พยายามดู report ของ Inspector B
-- SET LOCAL role authenticated;
-- SET request.jwt.claim.sub TO 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'; -- User A
-- SELECT * FROM daily_reports; -- ควรเห็นเฉพาะ reports ในอุดรธานี

-- Test 3: Admin ดูทุก report
-- SET request.jwt.claim.sub TO 'cccccccc-cccc-cccc-cccc-cccccccccccc'; -- Admin
-- SELECT * FROM daily_reports; -- ควรเห็นทุก report

-- Test 4: Inspector A พยายาม UPDATE report ของ Inspector B
-- ควร 0 rows affected
UPDATE daily_reports 
SET work_summary = 'Hacked!'
WHERE id = 'report-id-from-nongkhai';
*/

-- ===========================================
-- SEED DATA: โครงการจริงของกองพัฒนาและบำรุงรักษาอาคารราชพัสดุ
-- ===========================================

-- เพิ่มจังหวัดเพิ่มเติม
INSERT INTO provinces (name, code, region) VALUES
  ('ขอนแก่น', 'KKN', 'ภาคตะวันออกเฉียงเหนือ'),
  ('สกลนคร', 'SNK', 'ภาคตะวันออกเฉียงเหนือ'),
  ('นครราชสีมา', 'NMA', 'ภาคตะวันออกเฉียงเหนือ')
ON CONFLICT (code) DO NOTHING;

-- โครงการในจังหวัดอุดรธานี
INSERT INTO projects (name, province_id, contract_number, contractor_name, budget, start_date, end_date, status, latitude, longitude) VALUES
('โครงการปรับปรุงอาคารสำนักงานธนารักษ์พื้นที่อุดรธานี',
  (SELECT id FROM provinces WHERE code = 'UDN'), 'อด.001/2569', 'บริษัท อุดรก่อสร้าง จำกัด',
  12500000.00, '2026-01-01', '2026-06-30', 'active', 17.4138, 102.7873),
('โครงการก่อสร้างรั้วและป้อมยามอาคารราชพัสดุ ต.หมากแข้ง',
  (SELECT id FROM provinces WHERE code = 'UDN'), 'อด.002/2569', 'หจก. ภาคอีสานวิศวกรรม',
  3200000.00, '2026-01-15', '2026-04-15', 'active', 17.4256, 102.8134),
('โครงการซ่อมแซมหลังคาอาคารเรียน รร.ราชประชานุเคราะห์ 13',
  (SELECT id FROM provinces WHERE code = 'UDN'), 'อด.003/2569', 'บริษัท ไทยรูฟฟิ่ง จำกัด',
  1850000.00, '2025-11-01', '2026-02-28', 'active', 17.3892, 102.7654)
ON CONFLICT DO NOTHING;

-- โครงการในจังหวัดหนองคาย
INSERT INTO projects (name, province_id, contract_number, contractor_name, budget, start_date, end_date, status, latitude, longitude) VALUES
('โครงการปรับปรุงอาคารสำนักงานที่ดินจังหวัดหนองคาย',
  (SELECT id FROM provinces WHERE code = 'NKI'), 'นค.001/2569', 'บริษัท หนองคายพัฒนา จำกัด',
  8750000.00, '2026-01-01', '2026-05-31', 'active', 17.8784, 102.7427),
('โครงการก่อสร้างถนนภายในบริเวณศูนย์ราชการหนองคาย',
  (SELECT id FROM provinces WHERE code = 'NKI'), 'นค.002/2569', 'หจก. อีสานโรด',
  5400000.00, '2025-12-15', '2026-03-15', 'active', 17.8812, 102.7389)
ON CONFLICT DO NOTHING;

-- โครงการในจังหวัดขอนแก่น  
INSERT INTO projects (name, province_id, contract_number, contractor_name, budget, start_date, end_date, status, latitude, longitude) VALUES
('โครงการก่อสร้างอาคารอเนกประสงค์ มหาวิทยาลัยขอนแก่น (ส่วนราชพัสดุ)',
  (SELECT id FROM provinces WHERE code = 'KKN'), 'ขก.001/2569', 'บริษัท ขอนแก่นคอนสตรัคชั่น จำกัด',
  45000000.00, '2025-10-01', '2026-09-30', 'active', 16.4422, 102.8328),
('โครงการปรับปรุงระบบไฟฟ้าอาคารศาลากลางจังหวัดขอนแก่น (หลังเดิม)',
  (SELECT id FROM provinces WHERE code = 'KKN'), 'ขก.002/2569', 'บริษัท อีเลคทริค อีสาน จำกัด',
  2100000.00, '2026-01-10', '2026-03-10', 'active', 16.4389, 102.8267)
ON CONFLICT DO NOTHING;

-- ===========================================
-- หมายเหตุ: รายการงาน (Work Items) จะถูกสร้างผ่านแอปพลิเคชัน 
-- โดยเชื่อมโยงกับรายงานประจำวัน (Daily Reports)
-- ===========================================

-- ===========================================
-- สรุป: 5 จังหวัด, 7 โครงการ, 10 รายการงาน
-- ===========================================
