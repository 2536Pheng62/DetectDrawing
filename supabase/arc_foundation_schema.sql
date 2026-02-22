-- ===========================================
-- ARC FOUNDATION & SOIL TABLES (2023 Regulation)
-- ===========================================

-- 1. arc_soil_reports: ข้อมูลดินและพารามิเตอร์ที่ได้จากการเจาะสำรวจดิน (Boring Log)
CREATE TABLE arc_soil_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  boring_hole_no TEXT NOT NULL, -- หมายเลขหลุมเจาะ
  groundwater_level DECIMAL(10, 2), -- ระดับน้ำใต้ดิน (เมตร)
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. arc_soil_layers: ข้อมูลชั้นดินตามความลึก
CREATE TABLE arc_soil_layers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  soil_report_id UUID NOT NULL REFERENCES arc_soil_reports(id) ON DELETE CASCADE,
  depth_from DECIMAL(10, 2) NOT NULL, -- ความลึกเริ่มต้น (เมตร)
  depth_to DECIMAL(10, 2) NOT NULL, -- ความลึกสิ้นสุด (เมตร)
  soil_type TEXT NOT NULL CHECK (soil_type IN ('clay', 'sand', 'rock', 'other')),
  su_value DECIMAL(10, 2), -- Undrained Shear Strength (Su) สำหรับดินเหนียว (t/sq.m)
  n_value INTEGER, -- Standard Penetration Test (SPT) N-value
  friction_angle DECIMAL(10, 2), -- Angle of Internal Friction (องศา) สำหรับดินทราย
  unit_weight DECIMAL(10, 2), -- Total Unit Weight (t/cu.m)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. arc_foundation_designs: ข้อมูลการออกแบบฐานรากและรูปทรงเรขาคณิต
CREATE TABLE arc_foundation_designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  foundation_name TEXT NOT NULL, -- ชื่อฐานราก เช่น F1, F2
  foundation_type TEXT NOT NULL CHECK (foundation_type IN ('shallow', 'pile')),
  pile_type TEXT CHECK (pile_type IN ('friction', 'end_bearing')),
  is_group_pile BOOLEAN DEFAULT false,
  
  -- Geometric Parameters
  width DECIMAL(10, 2) NOT NULL, -- ความกว้าง (เมตร)
  length DECIMAL(10, 2) NOT NULL, -- ความยาว (เมตร)
  thickness DECIMAL(10, 2) NOT NULL, -- ความหนาฐานราก/Pile Cap (เมตร)
  concrete_cover_top DECIMAL(10, 2) NOT NULL, -- ระยะหุ้มหัวเสาเข็ม (เมตร)
  concrete_cover_edge DECIMAL(10, 2) NOT NULL, -- ระยะหุ้มขอบเสาเข็ม (เมตร)
  
  -- Pile Parameters
  pile_diameter DECIMAL(10, 2), -- ขนาดเส้นผ่านศูนย์กลางเสาเข็ม (เมตร)
  pile_length DECIMAL(10, 2), -- ความยาวเสาเข็มฝังดิน (เมตร)
  
  -- Applied Loads
  axial_load DECIMAL(10, 2) NOT NULL, -- แรงตามแนวแกน (ตัน)
  shear_force DECIMAL(10, 2) DEFAULT 0, -- แรงเฉือน (ตัน)
  overturning_moment DECIMAL(10, 2) DEFAULT 0, -- โมเมนต์พลิกคว่ำ (ตัน-เมตร)
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. arc_foundation_checks: ผลการตรวจสอบตามกฎกระทรวงฯ 2566
CREATE TABLE arc_foundation_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  foundation_design_id UUID NOT NULL REFERENCES arc_foundation_designs(id) ON DELETE CASCADE,
  soil_report_id UUID REFERENCES arc_soil_reports(id),
  
  -- Calculated Values
  calculated_bearing_capacity DECIMAL(10, 2),
  calculated_skin_friction DECIMAL(10, 2),
  
  -- Factor of Safety Checks
  fos_bearing DECIMAL(10, 2),
  fos_sliding DECIMAL(10, 2),
  fos_overturning DECIMAL(10, 2),
  
  -- Geometric Checks
  is_thickness_passed BOOLEAN,
  is_cover_passed BOOLEAN,
  
  -- Overall Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'pass', 'fail')),
  defect_report JSONB,
  
  checked_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_arc_soil_reports_project ON arc_soil_reports(project_id);
CREATE INDEX idx_arc_soil_layers_report ON arc_soil_layers(soil_report_id);
CREATE INDEX idx_arc_foundation_designs_project ON arc_foundation_designs(project_id);
CREATE INDEX idx_arc_foundation_checks_design ON arc_foundation_checks(foundation_design_id);

-- Triggers for Audit Logs
CREATE TRIGGER audit_arc_soil_reports AFTER INSERT OR UPDATE OR DELETE ON arc_soil_reports FOR EACH ROW EXECUTE FUNCTION log_audit_changes();
CREATE TRIGGER audit_arc_soil_layers AFTER INSERT OR UPDATE OR DELETE ON arc_soil_layers FOR EACH ROW EXECUTE FUNCTION log_audit_changes();
CREATE TRIGGER audit_arc_foundation_designs AFTER INSERT OR UPDATE OR DELETE ON arc_foundation_designs FOR EACH ROW EXECUTE FUNCTION log_audit_changes();
CREATE TRIGGER audit_arc_foundation_checks AFTER INSERT OR UPDATE OR DELETE ON arc_foundation_checks FOR EACH ROW EXECUTE FUNCTION log_audit_changes();
