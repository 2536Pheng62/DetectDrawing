import { ArcFoundationDesign, ArcSoilLayer } from '@/types/database';

/**
 * ตรวจสอบระยะทางเรขาคณิต (Geometric Checks) ตามกฎกระทรวง พ.ศ. 2566
 */
export function checkGeometry(design: ArcFoundationDesign): { thicknessPassed: boolean, coverPassed: boolean } {
    let thicknessPassed = false;
    
    if (design.foundation_type === 'pile') {
        // เสาเข็มรับแรงเสียดทาน (Friction Pile) ความหนาฐานรากต้อง >= 0.20 ม.
        // เสาเข็มรับน้ำหนักที่ปลาย (End Bearing Pile) ความหนาฐานรากต้อง >= 0.35 ม.
        if (design.pile_type === 'friction') {
            thicknessPassed = design.thickness >= 0.20;
        } else {
            thicknessPassed = design.thickness >= 0.35;
        }
    } else {
        // ฐานแผ่ (Shallow Foundation)
        thicknessPassed = true; // สมมติว่าผ่านไปก่อน (กฎหมายอาจมีเกณฑ์อื่น)
    }

    let coverPassed = false;
    if (design.foundation_type === 'pile' && design.pile_diameter) {
        const minEdgeCover = design.pile_diameter / 2;
        
        if (design.is_group_pile) {
            // เสาเข็มกลุ่ม: ระยะหุ้มหัวเสาเข็ม >= 0.075 ม., ระยะหุ้มขอบ >= D/2
            coverPassed = design.concrete_cover_top >= 0.075 && design.concrete_cover_edge >= minEdgeCover;
        } else {
            // เสาเข็มเดี่ยว: ระยะหุ้มหัวเสาเข็ม >= 0.15 ม., ระยะหุ้มขอบ >= D/2
            coverPassed = design.concrete_cover_top >= 0.15 && design.concrete_cover_edge >= minEdgeCover;
        }
    } else {
        // ฐานแผ่: ระยะหุ้มคอนกรีตที่สัมผัสดินโดยตรงมักจะ >= 0.075 ม. (ตามมาตรฐาน วสท.)
        coverPassed = design.concrete_cover_top >= 0.075 && design.concrete_cover_edge >= 0.075;
    }
    
    return { thicknessPassed, coverPassed };
}

/**
 * คำนวณหน่วยแรงเสียดทานดินเหนียวตามความลึก (Skin Friction Integration)
 * ตามสมการในกฎกระทรวง พ.ศ. 2566
 * 
 * @param layers ข้อมูลชั้นดิน
 * @param pileLength ความยาวเสาเข็มฝังดิน (เมตร)
 * @returns แรงเสียดทานรวม (ตัน/ตร.ม.)
 */
export function calculateClaySkinFriction(layers: ArcSoilLayer[], pileLength: number): number {
    let totalFriction = 0;
    let currentDepth = 0;

    for (const layer of layers) {
        if (currentDepth >= pileLength) break;
        if (layer.soil_type !== 'clay') continue; // ข้ามถ้าไม่ใช่ดินเหนียว
        if (!layer.su_value) continue; // ไม่มีค่า Su

        const layerStart = Math.max(currentDepth, layer.depth_from);
        const layerEnd = Math.min(pileLength, layer.depth_to);
        const layerThickness = layerEnd - layerStart;

        if (layerThickness <= 0) continue;

        // คำนวณตามสมการกฎกระทรวง 2566
        // Su มีหน่วยเป็น t/sq.m (หรือ kPa / 10)
        // กฎหมายระบุ:
        // ลึกไม่เกิน 10 ม.: f <= 5 kPa (หรือ 0.5 t/sq.m) หรือ Su/2
        // ลึก 10-15 ม.: f = 5 + ((z-10)/5) * (Su/2 - 5) kPa
        // ลึกเกิน 15 ม.: f = Su/2
        
        // แปลง Su จาก t/sq.m เป็น kPa (1 t/sq.m ≈ 10 kPa)
        const su_kPa = layer.su_value * 10;
        let allowableFriction_kPa = 0; 
        
        if (layerEnd <= 10) {
            allowableFriction_kPa = Math.min(5, su_kPa / 2);
        } else if (layerEnd <= 15) {
            const z = layerEnd; // ใช้ความลึกปลายชั้นประเมินแบบอนุรักษ์นิยม
            allowableFriction_kPa = 5 + ((z - 10) / 5) * ((su_kPa / 2) - 5);
        } else {
            allowableFriction_kPa = su_kPa / 2;
        }

        // แปลงกลับเป็น t/sq.m
        const allowableFriction_t_sqm = allowableFriction_kPa / 10;

        totalFriction += allowableFriction_t_sqm * layerThickness; // อินทิเกรตตามความหนาชั้น
        currentDepth = layerEnd;
    }
    
    return totalFriction;
}

/**
 * ประเมินอัตราส่วนความปลอดภัย (Factor of Safety)
 */
export function calculateFactorOfSafety(
    design: ArcFoundationDesign, 
    ultimateBearingCapacity: number, // Q_ult (ตัน)
    resistingSlidingForce: number, // แรงต้านทานการเลื่อนไถล (ตัน)
    resistingOverturningMoment: number // โมเมนต์ต้านทานการพลิกคว่ำ (ตัน-เมตร)
) {
    // FoS Bearing = Q_ult / P
    const fos_bearing = design.axial_load > 0 ? ultimateBearingCapacity / design.axial_load : 999;
    
    // FoS Sliding = Resisting Force / Shear Force
    const fos_sliding = design.shear_force > 0 ? resistingSlidingForce / design.shear_force : 999;
    
    // FoS Overturning = Resisting Moment / Overturning Moment
    const fos_overturning = design.overturning_moment > 0 ? resistingOverturningMoment / design.overturning_moment : 999;
    
    return {
        fos_bearing,
        fos_sliding,
        fos_overturning,
        is_bearing_passed: fos_bearing >= 3.0,
        is_sliding_passed: fos_sliding >= 1.5,
        is_overturning_passed: fos_overturning >= 2.0
    };
}
