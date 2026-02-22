-- ===========================================
-- SAMPLE DATA FOR TESTING
-- ===========================================
-- 1. ตรวจสอบและเพิ่มจังหวัด (ถ้ายังไม่มี)
INSERT INTO provinces (name, code, region)
VALUES ('นนทบุรี', 'NBI', 'ภาคกลาง') ON CONFLICT (name) DO NOTHING;
-- 2. สร้างโครงการตัวอย่าง
INSERT INTO projects (
        name,
        contract_number,
        province_id,
        budget,
        start_date,
        end_date,
        contractor_name,
        status
    )
SELECT 'โครงการก่อสร้างอาคารสำนักงานใหม่ (ตัวอย่าง)',
    'CON-2024-001',
    p.id,
    15000000.00,
    CURRENT_DATE - INTERVAL '30 days',
    CURRENT_DATE + INTERVAL '150 days',
    'บริษัท วิศวกรรมไทย จำกัด',
    'active'
FROM provinces p
WHERE p.name = 'นนทบุรี'
LIMIT 1;
-- 3. สร้างงวดงาน (Milestones)
INSERT INTO contract_milestones (
        project_id,
        milestone_number,
        name,
        planned_start_date,
        planned_end_date,
        payment_percent
    )
SELECT id,
    1,
    'งวดที่ 1: งานปรับพื้นที่และฐานราก',
    CURRENT_DATE - INTERVAL '30 days',
    CURRENT_DATE - INTERVAL '5 days',
    20.00
FROM projects
WHERE contract_number = 'CON-2024-001';
INSERT INTO contract_milestones (
        project_id,
        milestone_number,
        name,
        planned_start_date,
        planned_end_date,
        payment_percent
    )
SELECT id,
    2,
    'งวดที่ 2: งานโครงสร้างชั้น 1',
    CURRENT_DATE - INTERVAL '4 days',
    CURRENT_DATE + INTERVAL '25 days',
    30.00
FROM projects
WHERE contract_number = 'CON-2024-001';
-- 4. สร้างรายงานประจำวัน (ตัวอย่าง)
INSERT INTO daily_reports (
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
    'ดำเนินการเทคอนกรีตฐานรากเสร็จสิ้น 100% พร้อมเริ่มงานเสาตอม่อ',
    'approved'
FROM projects
WHERE contract_number = 'CON-2024-001';
-- 5. เพิ่มรายการงานในรายงาน
INSERT INTO work_items (
        daily_report_id,
        milestone_id,
        task_name,
        unit,
        planned_quantity,
        actual_quantity,
        progress_percent,
        weight
    )
SELECT dr.id,
    cm.id,
    'งานเทคอนกรีตฐานราก',
    'ลบ.ม.',
    120.00,
    120.00,
    100.00,
    10.00
FROM daily_reports dr
    JOIN projects p ON dr.project_id = p.id
    JOIN contract_milestones cm ON cm.project_id = p.id
WHERE p.contract_number = 'CON-2024-001'
    AND cm.milestone_number = 1;