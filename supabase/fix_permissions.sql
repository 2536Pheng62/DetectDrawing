-- ===========================================
-- 1. เชื่อมต่อสิทธิ์ (สำคัญอันดับ 1)
-- ===========================================
INSERT INTO public.users (id, email, full_name, role)
SELECT id,
    email,
    'Admin User',
    'admin'
FROM auth.users
WHERE email = 'pang8577@gmail.com' ON CONFLICT (id) DO
UPDATE
SET role = 'admin',
    full_name = 'Admin User';
-- ===========================================
-- 2. เคลียร์ข้อมูลโครงการตัวอย่าง (ลบตามลำดับความสัมพันธ์)
-- ===========================================
-- ลบ Work Items ที่เชื่อมกับรายงานของโครงการนี้
DELETE FROM public.work_items
WHERE daily_report_id IN (
        SELECT id
        FROM public.daily_reports
        WHERE project_id IN (
                SELECT id
                FROM public.projects
                WHERE contract_number = 'CON-2024-001'
            )
    );
-- ลบรูปภาพ
DELETE FROM public.photos
WHERE daily_report_id IN (
        SELECT id
        FROM public.daily_reports
        WHERE project_id IN (
                SELECT id
                FROM public.projects
                WHERE contract_number = 'CON-2024-001'
            )
    );
-- ลบรายงานรายวัน
DELETE FROM public.daily_reports
WHERE project_id IN (
        SELECT id
        FROM public.projects
        WHERE contract_number = 'CON-2024-001'
    );
-- ลบงวดงาน
DELETE FROM public.contract_milestones
WHERE project_id IN (
        SELECT id
        FROM public.projects
        WHERE contract_number = 'CON-2024-001'
    );
-- สุดท้าย... ลบตัวโครงการ
DELETE FROM public.projects
WHERE contract_number = 'CON-2024-001';
-- ===========================================
-- 3. ลงข้อมูลโครงการตัวอย่างใหม่แบบสะอาด
-- ===========================================
INSERT INTO public.provinces (name, code, region)
VALUES ('นนทบุรี', 'NBI', 'ภาคกลาง') ON CONFLICT (name) DO NOTHING;
INSERT INTO public.projects (
        id,
        name,
        province_id,
        contract_number,
        contractor_name,
        budget,
        start_date,
        end_date,
        status
    )
VALUES (
        gen_random_uuid(),
        'โครงการก่อสร้างอาคารสำนักงานใหม่ (ตัวอย่าง)',
        (
            SELECT id
            FROM public.provinces
            WHERE name = 'นนทบุรี'
            LIMIT 1
        ), 'CON-2024-001', 'บริษัท วิศวกรรมไทย จำกัด', 15000000.00, CURRENT_DATE - INTERVAL '30 days',
        CURRENT_DATE + INTERVAL '150 days',
        'active'
    );
-- ===========================================
-- 4. ลงข้อมูลรายงาน (สำหรับทดสอบรายงานรายเดือน)
-- ===========================================
INSERT INTO public.contract_milestones (
        project_id,
        milestone_number,
        name,
        planned_start_date,
        planned_end_date,
        payment_percent
    )
SELECT id,
    1,
    'งวดที่ 1: งานฐานราก',
    CURRENT_DATE - INTERVAL '30 days',
    CURRENT_DATE - INTERVAL '5 days',
    20.00
FROM projects
WHERE contract_number = 'CON-2024-001';
INSERT INTO public.daily_reports (
        project_id,
        report_date,
        weather,
        labor_count,
        work_summary,
        status
    )
SELECT id,
    CURRENT_DATE - INTERVAL '1 day',
    'sunny',
    15,
    'สรุปงานประจำเดือนตัวอย่าง (ข้อมูลสำหรับ Test)',
    'approved'
FROM projects
WHERE contract_number = 'CON-2024-001';