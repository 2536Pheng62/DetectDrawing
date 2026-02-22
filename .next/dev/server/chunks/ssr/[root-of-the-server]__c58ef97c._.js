module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/OneDrive/Apps/detctDrawing/src/components/SCurvePreview.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SCurvePreview",
    ()=>SCurvePreview
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Apps/detctDrawing/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Apps/detctDrawing/node_modules/styled-jsx/style.js [app-ssr] (ecmascript)");
'use client';
;
;
function SCurvePreview({ planned = [], actual = [], width = 120, height = 40 }) {
    // ถ้าไม่มีข้อมูล ให้สร้างตัวอย่าง (Mock) เพื่อความสวยงาม
    const defaultPlanned = [
        0,
        10,
        25,
        45,
        70,
        90,
        100
    ];
    const defaultActual = [
        0,
        8,
        20,
        35
    ];
    const pData = planned.length > 0 ? planned : defaultPlanned;
    const aData = actual.length > 0 ? actual : defaultActual;
    const getPath = (data)=>{
        if (data.length < 2) return "";
        const points = data.map((val, i)=>{
            const x = i / (pData.length - 1) * width;
            const y = height - val / 100 * height;
            return `${x},${y}`;
        }).join(" ");
        return points;
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: width,
        height: height,
        className: "jsx-a3c3b2092371507e" + " " + "s-curve-preview",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("polyline", {
                fill: "none",
                stroke: "#cbd5e1",
                strokeWidth: "2",
                strokeDasharray: "4,2",
                points: getPath(pData),
                className: "jsx-a3c3b2092371507e"
            }, void 0, false, {
                fileName: "[project]/OneDrive/Apps/detctDrawing/src/components/SCurvePreview.tsx",
                lineNumber: 33,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("polyline", {
                fill: "none",
                stroke: "#2563eb",
                strokeWidth: "2",
                strokeLinecap: "round",
                strokeLinejoin: "round",
                points: getPath(aData),
                className: "jsx-a3c3b2092371507e"
            }, void 0, false, {
                fileName: "[project]/OneDrive/Apps/detctDrawing/src/components/SCurvePreview.tsx",
                lineNumber: 40,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                id: "a3c3b2092371507e",
                children: ".s-curve-preview.jsx-a3c3b2092371507e{filter:drop-shadow(0 2px 4px #2563eb1a)}"
            }, void 0, false, void 0, this)
        ]
    }, void 0, true, {
        fileName: "[project]/OneDrive/Apps/detctDrawing/src/components/SCurvePreview.tsx",
        lineNumber: 32,
        columnNumber: 9
    }, this);
}
}),
"[project]/OneDrive/Apps/detctDrawing/src/lib/supabase.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createClient",
    ()=>createClient,
    "getSupabase",
    ()=>getSupabase
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/OneDrive/Apps/detctDrawing/node_modules/@supabase/ssr/dist/module/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createBrowserClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Apps/detctDrawing/node_modules/@supabase/ssr/dist/module/createBrowserClient.js [app-ssr] (ecmascript)");
;
function createClient() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createBrowserClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createBrowserClient"])(("TURBOPACK compile-time value", "https://iikrxzojrcoebsnkfhks.supabase.co"), ("TURBOPACK compile-time value", "sb_publishable_8KdZx6zc6lYMdtscgT74tQ_bxMn4cWi"));
}
// Singleton instance สำหรับ client-side
let supabaseInstance = null;
function getSupabase() {
    if (!supabaseInstance) {
        supabaseInstance = createClient();
    }
    return supabaseInstance;
}
}),
"[project]/OneDrive/Apps/detctDrawing/src/lib/progress-calculator.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calculatePlannedProgress",
    ()=>calculatePlannedProgress,
    "calculateWeightedProgress",
    ()=>calculateWeightedProgress,
    "getAllProjectProgress",
    ()=>getAllProjectProgress,
    "getDashboardSummary",
    ()=>getDashboardSummary,
    "getDelayedProjects",
    ()=>getDelayedProjects,
    "getProjectStatus",
    ()=>getProjectStatus,
    "getProvinceSummaries",
    ()=>getProvinceSummaries
]);
/**
 * Progress Calculator สำหรับ PM Dashboard
 * ใช้สูตร Weighted Average ตามมาตรฐานงานวิศวกรรม
 * 
 * Formula: Progress = Σ(Actual_Qty × Weight) / Σ(Planned_Qty × Weight) × 100
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Apps/detctDrawing/src/lib/supabase.ts [app-ssr] (ecmascript)");
;
function calculateWeightedProgress(workItems) {
    if (!workItems || workItems.length === 0) return 0;
    const totalWeight = workItems.reduce((sum, item)=>sum + (item.weight || 1), 0);
    if (totalWeight === 0) return 0;
    const weightedSum = workItems.reduce((sum, item)=>sum + item.progress_percent * (item.weight || 1), 0);
    return Math.round(weightedSum / totalWeight * 100) / 100;
}
function calculatePlannedProgress(startDate, endDate, currentDate = new Date()) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = currentDate;
    if (now <= start) return 0;
    if (now >= end) return 100;
    const totalDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    const elapsedDays = (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    return Math.round(elapsedDays / totalDays * 10000) / 100;
}
function getProjectStatus(variance) {
    if (variance >= 5) return 'ahead'; // เร็วกว่าแผน 5%+
    if (variance >= -5) return 'on-track'; // อยู่ในแผน ±5%
    if (variance >= -15) return 'delayed'; // ล่าช้า 5-15%
    return 'critical'; // ล่าช้ามาก 15%+
}
async function getAllProjectProgress() {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
    // ดึงโครงการทั้งหมด
    const { data: projects, error: projectError } = await supabase.from('projects').select(`
            *,
            provinces (name)
        `).eq('status', 'active');
    if (projectError || !projects) {
        console.error('Error fetching projects:', projectError);
        return [];
    }
    const results = [];
    for (const project of projects){
        // ดึง work items จากรายงานล่าสุด
        const { data: latestReport } = await supabase.from('daily_reports').select(`
                report_date,
                work_items (*)
            `).eq('project_id', project.id).order('report_date', {
            ascending: false
        }).limit(1).single();
        const workItems = latestReport?.work_items || [];
        const totalProgress = calculateWeightedProgress(workItems);
        const plannedProgress = calculatePlannedProgress(project.start_date, project.end_date);
        const variance = totalProgress - plannedProgress;
        const daysRemaining = Math.ceil((new Date(project.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        results.push({
            project: {
                ...project,
                province_name: project.provinces?.name
            },
            totalProgress,
            plannedProgress,
            variance,
            status: getProjectStatus(variance),
            lastReportDate: latestReport?.report_date,
            daysRemaining: Math.max(0, daysRemaining)
        });
    }
    return results;
}
async function getProvinceSummaries() {
    const allProgress = await getAllProjectProgress();
    // กลุ่มตามจังหวัด
    const provinceMap = new Map();
    for (const progress of allProgress){
        const provinceId = progress.project.province_id;
        if (!provinceMap.has(provinceId)) {
            provinceMap.set(provinceId, []);
        }
        provinceMap.get(provinceId).push(progress);
    }
    // สร้าง Summary แต่ละจังหวัด
    const summaries = [];
    for (const [provinceId, projects] of Array.from(provinceMap.entries())){
        const avgProgress = projects.reduce((sum, p)=>sum + p.totalProgress, 0) / projects.length;
        const delayedProjects = projects.filter((p)=>p.status === 'delayed' || p.status === 'critical').length;
        const totalBudget = projects.reduce((sum, p)=>sum + (p.project.budget || 0), 0);
        let status;
        if (delayedProjects === 0) {
            status = 'good';
        } else if (delayedProjects <= projects.length * 0.3) {
            status = 'warning';
        } else {
            status = 'critical';
        }
        summaries.push({
            provinceId,
            provinceName: projects[0]?.project.province_name || 'ไม่ระบุ',
            projectCount: projects.length,
            avgProgress: Math.round(avgProgress * 100) / 100,
            totalBudget,
            delayedProjects,
            status
        });
    }
    // เรียงตามสถานะ (critical ก่อน)
    return summaries.sort((a, b)=>{
        const order = {
            critical: 0,
            warning: 1,
            good: 2
        };
        return order[a.status] - order[b.status];
    });
}
async function getDashboardSummary() {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
    // นับโครงการตามสถานะ
    const { data: projects } = await supabase.from('projects').select('id, status, budget');
    if (!projects) {
        return {
            totalProjects: 0,
            totalBudget: 0,
            avgProgress: 0,
            activeProjects: 0,
            completedProjects: 0,
            delayedProjects: 0,
            criticalProjects: 0
        };
    }
    const allProgress = await getAllProjectProgress();
    const activeProjects = projects.filter((p)=>p.status === 'active').length;
    const completedProjects = projects.filter((p)=>p.status === 'completed').length;
    const delayedProjects = allProgress.filter((p)=>p.status === 'delayed').length;
    const criticalProjects = allProgress.filter((p)=>p.status === 'critical').length;
    const totalBudget = projects.reduce((sum, p)=>sum + (p.budget || 0), 0);
    const avgProgress = allProgress.length > 0 ? allProgress.reduce((sum, p)=>sum + p.totalProgress, 0) / allProgress.length : 0;
    return {
        totalProjects: projects.length,
        totalBudget,
        avgProgress: Math.round(avgProgress * 100) / 100,
        activeProjects,
        completedProjects,
        delayedProjects,
        criticalProjects
    };
}
async function getDelayedProjects() {
    const allProgress = await getAllProjectProgress();
    return allProgress.filter((p)=>p.status === 'delayed' || p.status === 'critical').sort((a, b)=>a.variance - b.variance); // เรียงจากล่าช้ามากไปน้อย
}
}),
"[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DashboardPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Apps/detctDrawing/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Apps/detctDrawing/node_modules/styled-jsx/style.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Apps/detctDrawing/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Apps/detctDrawing/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$src$2f$components$2f$SCurvePreview$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Apps/detctDrawing/src/components/SCurvePreview.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$src$2f$lib$2f$progress$2d$calculator$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Apps/detctDrawing/src/lib/progress-calculator.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
const STATUS_COLORS = {
    ahead: {
        bg: '#e8f5e9',
        text: '#2e7d32',
        label: 'เร็วกว่าแผน'
    },
    'on-track': {
        bg: '#e8f5e9',
        text: '#2e7d32',
        label: 'ตามแผน'
    },
    delayed: {
        bg: '#fff3e0',
        text: '#ef6c00',
        label: 'ล่าช้า'
    },
    critical: {
        bg: '#ffebee',
        text: '#c62828',
        label: 'ล่าช้ามาก'
    },
    good: {
        bg: '#e8f5e9',
        text: '#2e7d32',
        label: 'ดี'
    },
    warning: {
        bg: '#fff3e0',
        text: '#ef6c00',
        label: 'ต้องติดตาม'
    }
};
function DashboardPage() {
    const [summary, setSummary] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [provinces, setProvinces] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [delayedProjects, setDelayedProjects] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        loadDashboardData();
    }, []);
    const loadDashboardData = async ()=>{
        try {
            setLoading(true);
            const [summaryData, provincesData, delayedData] = await Promise.all([
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$src$2f$lib$2f$progress$2d$calculator$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDashboardSummary"])(),
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$src$2f$lib$2f$progress$2d$calculator$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getProvinceSummaries"])(),
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$src$2f$lib$2f$progress$2d$calculator$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDelayedProjects"])()
            ]);
            setSummary(summaryData);
            setProvinces(provincesData);
            setDelayedProjects(delayedData);
        } catch (err) {
            setError('ไม่สามารถโหลดข้อมูลได้');
            console.error(err);
        } finally{
            setLoading(false);
        }
    };
    const formatBudget = (amount)=>{
        if (amount >= 1000000) {
            return `${(amount / 1000000).toFixed(2)} ล้านบาท`;
        }
        return `${amount.toLocaleString()} บาท`;
    };
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "dashboard-loading",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "spinner",
                    children: "⏳"
                }, void 0, false, {
                    fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                    lineNumber: 74,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    children: "กำลังโหลดข้อมูล..."
                }, void 0, false, {
                    fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                    lineNumber: 75,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
            lineNumber: 73,
            columnNumber: 13
        }, this);
    }
    if (error) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "dashboard-error",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    children: [
                        "⚠️ ",
                        error
                    ]
                }, void 0, true, {
                    fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                    lineNumber: 83,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: loadDashboardData,
                    children: "ลองใหม่"
                }, void 0, false, {
                    fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                    lineNumber: 84,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
            lineNumber: 82,
            columnNumber: 13
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "jsx-60d7291aa32d9d4d" + " " + "dashboard",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "jsx-60d7291aa32d9d4d" + " " + "dashboard-header",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "jsx-60d7291aa32d9d4d",
                        children: "📊 แดชบอร์ดภาพรวมโครงการ"
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                        lineNumber: 93,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "jsx-60d7291aa32d9d4d" + " " + "subtitle",
                        children: "กองพัฒนาและบำรุงรักษาอาคารราชพัสดุ"
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                        lineNumber: 94,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-60d7291aa32d9d4d" + " " + "header-actions",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: "/arc/foundation/dashboard",
                                className: "arc-btn",
                                children: "🏗️ ตรวจสอบฐานราก (ARC)"
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                lineNumber: 96,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: "/arc/check",
                                className: "arc-btn",
                                style: {
                                    marginLeft: '10px',
                                    backgroundColor: '#8b5cf6'
                                },
                                children: "🔍 ตรวจสอบ BIM (IfcTester)"
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                lineNumber: 99,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: loadDashboardData,
                                className: "jsx-60d7291aa32d9d4d" + " " + "refresh-btn",
                                children: "🔄 รีเฟรช"
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                lineNumber: 102,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                        lineNumber: 95,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                lineNumber: 92,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "jsx-60d7291aa32d9d4d" + " " + "summary-cards",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-60d7291aa32d9d4d" + " " + "card total",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-60d7291aa32d9d4d" + " " + "card-icon",
                                children: "📋"
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                lineNumber: 111,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-60d7291aa32d9d4d" + " " + "card-content",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-60d7291aa32d9d4d" + " " + "card-value",
                                        children: summary?.totalProjects || 0
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                        lineNumber: 113,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-60d7291aa32d9d4d" + " " + "card-label",
                                        children: "โครงการทั้งหมด"
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                        lineNumber: 114,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                lineNumber: 112,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                        lineNumber: 110,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-60d7291aa32d9d4d" + " " + "card budget",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-60d7291aa32d9d4d" + " " + "card-icon",
                                children: "💰"
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                lineNumber: 119,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-60d7291aa32d9d4d" + " " + "card-content",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-60d7291aa32d9d4d" + " " + "card-value",
                                        children: formatBudget(summary?.totalBudget || 0)
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                        lineNumber: 121,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-60d7291aa32d9d4d" + " " + "card-label",
                                        children: "งบประมาณรวม"
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                        lineNumber: 122,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                lineNumber: 120,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                        lineNumber: 118,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-60d7291aa32d9d4d" + " " + "card progress",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-60d7291aa32d9d4d" + " " + "card-icon",
                                children: "📈"
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                lineNumber: 127,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-60d7291aa32d9d4d" + " " + "card-content",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-60d7291aa32d9d4d" + " " + "card-value",
                                        children: [
                                            summary?.avgProgress?.toFixed(1) || 0,
                                            "%"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                        lineNumber: 129,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-60d7291aa32d9d4d" + " " + "card-label",
                                        children: "ความคืบหน้าเฉลี่ย"
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                        lineNumber: 130,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                lineNumber: 128,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                        lineNumber: 126,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-60d7291aa32d9d4d" + " " + "card active",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-60d7291aa32d9d4d" + " " + "card-icon",
                                children: "🚧"
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                lineNumber: 135,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-60d7291aa32d9d4d" + " " + "card-content",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-60d7291aa32d9d4d" + " " + "card-value",
                                        children: summary?.activeProjects || 0
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                        lineNumber: 137,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-60d7291aa32d9d4d" + " " + "card-label",
                                        children: "กำลังดำเนินการ"
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                        lineNumber: 138,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                lineNumber: 136,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                        lineNumber: 134,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-60d7291aa32d9d4d" + " " + "card delayed",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-60d7291aa32d9d4d" + " " + "card-icon",
                                children: "⚠️"
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                lineNumber: 143,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-60d7291aa32d9d4d" + " " + "card-content",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-60d7291aa32d9d4d" + " " + "card-value",
                                        children: summary?.delayedProjects || 0
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                        lineNumber: 145,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-60d7291aa32d9d4d" + " " + "card-label",
                                        children: "ล่าช้า"
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                        lineNumber: 146,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                lineNumber: 144,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                        lineNumber: 142,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-60d7291aa32d9d4d" + " " + "card critical",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-60d7291aa32d9d4d" + " " + "card-icon",
                                children: "🔴"
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                lineNumber: 151,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-60d7291aa32d9d4d" + " " + "card-content",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-60d7291aa32d9d4d" + " " + "card-value",
                                        children: summary?.criticalProjects || 0
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                        lineNumber: 153,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-60d7291aa32d9d4d" + " " + "card-label",
                                        children: "ล่าช้ามาก"
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                        lineNumber: 154,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                lineNumber: 152,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                        lineNumber: 150,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                lineNumber: 109,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "jsx-60d7291aa32d9d4d" + " " + "section",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "jsx-60d7291aa32d9d4d",
                        children: "🗺️ สรุปรายจังหวัด"
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                        lineNumber: 161,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-60d7291aa32d9d4d" + " " + "province-grid",
                        children: provinces.map((province)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    backgroundColor: STATUS_COLORS[province.status].bg,
                                    borderLeftColor: STATUS_COLORS[province.status].text
                                },
                                className: "jsx-60d7291aa32d9d4d" + " " + "province-card",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-60d7291aa32d9d4d" + " " + "province-header",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "jsx-60d7291aa32d9d4d",
                                                children: province.provinceName
                                            }, void 0, false, {
                                                fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                                lineNumber: 173,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    backgroundColor: STATUS_COLORS[province.status].text
                                                },
                                                className: "jsx-60d7291aa32d9d4d" + " " + "status-badge",
                                                children: STATUS_COLORS[province.status].label
                                            }, void 0, false, {
                                                fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                                lineNumber: 174,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                        lineNumber: 172,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-60d7291aa32d9d4d" + " " + "province-stats",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-60d7291aa32d9d4d" + " " + "stat",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-60d7291aa32d9d4d" + " " + "stat-value",
                                                        children: province.projectCount
                                                    }, void 0, false, {
                                                        fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                                        lineNumber: 185,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-60d7291aa32d9d4d" + " " + "stat-label",
                                                        children: "โครงการ"
                                                    }, void 0, false, {
                                                        fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                                        lineNumber: 186,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                                lineNumber: 184,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-60d7291aa32d9d4d" + " " + "stat",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-60d7291aa32d9d4d" + " " + "stat-value",
                                                        children: [
                                                            province.avgProgress.toFixed(1),
                                                            "%"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                                        lineNumber: 189,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-60d7291aa32d9d4d" + " " + "stat-label",
                                                        children: "ความคืบหน้า"
                                                    }, void 0, false, {
                                                        fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                                        lineNumber: 190,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                                lineNumber: 188,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-60d7291aa32d9d4d" + " " + "stat",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-60d7291aa32d9d4d" + " " + "stat-value",
                                                        children: province.delayedProjects
                                                    }, void 0, false, {
                                                        fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                                        lineNumber: 193,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-60d7291aa32d9d4d" + " " + "stat-label",
                                                        children: "ล่าช้า"
                                                    }, void 0, false, {
                                                        fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                                        lineNumber: 194,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                                lineNumber: 192,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                        lineNumber: 183,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-60d7291aa32d9d4d" + " " + "progress-bar",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                width: `${Math.min(province.avgProgress, 100)}%`,
                                                backgroundColor: STATUS_COLORS[province.status].text
                                            },
                                            className: "jsx-60d7291aa32d9d4d" + " " + "progress-fill"
                                        }, void 0, false, {
                                            fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                            lineNumber: 199,
                                            columnNumber: 33
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                        lineNumber: 198,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, province.provinceId, true, {
                                fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                lineNumber: 164,
                                columnNumber: 25
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                        lineNumber: 162,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                lineNumber: 160,
                columnNumber: 13
            }, this),
            delayedProjects.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "jsx-60d7291aa32d9d4d" + " " + "section alert-section",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "jsx-60d7291aa32d9d4d",
                        children: "🚨 โครงการที่ต้องติดตาม"
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                        lineNumber: 215,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-60d7291aa32d9d4d" + " " + "alert-list",
                        children: delayedProjects.slice(0, 5).map((project)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    backgroundColor: STATUS_COLORS[project.status].bg
                                },
                                className: "jsx-60d7291aa32d9d4d" + " " + "alert-item",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-60d7291aa32d9d4d" + " " + "alert-info",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                className: "jsx-60d7291aa32d9d4d",
                                                children: project.project.name
                                            }, void 0, false, {
                                                fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                                lineNumber: 226,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "jsx-60d7291aa32d9d4d" + " " + "alert-province",
                                                children: project.project.province_name
                                            }, void 0, false, {
                                                fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                                lineNumber: 227,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                        lineNumber: 225,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-60d7291aa32d9d4d" + " " + "alert-progress",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-60d7291aa32d9d4d" + " " + "progress-actual",
                                                children: [
                                                    project.totalProgress.toFixed(1),
                                                    "%"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                                lineNumber: 230,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-60d7291aa32d9d4d" + " " + "progress-separator",
                                                children: "vs"
                                            }, void 0, false, {
                                                fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                                lineNumber: 231,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-60d7291aa32d9d4d" + " " + "progress-planned",
                                                children: [
                                                    project.plannedProgress.toFixed(1),
                                                    "%"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                                lineNumber: 232,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                        lineNumber: 229,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            color: STATUS_COLORS[project.status].text
                                        },
                                        className: "jsx-60d7291aa32d9d4d" + " " + "alert-variance",
                                        children: [
                                            project.variance > 0 ? '+' : '',
                                            project.variance.toFixed(1),
                                            "%"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                        lineNumber: 234,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-60d7291aa32d9d4d" + " " + "alert-days",
                                        children: [
                                            project.daysRemaining,
                                            " วันเหลือ"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                        lineNumber: 237,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-60d7291aa32d9d4d" + " " + "alert-actions",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$src$2f$components$2f$SCurvePreview$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SCurvePreview"], {
                                                planned: [
                                                    0,
                                                    20,
                                                    40,
                                                    60,
                                                    80,
                                                    100
                                                ],
                                                actual: [
                                                    0,
                                                    project.totalProgress
                                                ]
                                            }, void 0, false, {
                                                fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                                lineNumber: 241,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                href: `/reports/monthly/${project.project.id}`,
                                                className: "report-link secondary",
                                                children: "📊 รายงานรายเดือน"
                                            }, void 0, false, {
                                                fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                                lineNumber: 245,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                href: `/reports/project/${project.project.id}`,
                                                className: "report-link secondary",
                                                children: "📋 รายการรายวัน"
                                            }, void 0, false, {
                                                fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                                lineNumber: 248,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                href: `/reports/new?projectId=${project.project.id}`,
                                                className: "report-link",
                                                children: "📝 เขียนรายงาน"
                                            }, void 0, false, {
                                                fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                                lineNumber: 251,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                        lineNumber: 240,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, project.project.id, true, {
                                fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                                lineNumber: 218,
                                columnNumber: 29
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                        lineNumber: 216,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
                lineNumber: 214,
                columnNumber: 17
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Apps$2f$detctDrawing$2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                id: "60d7291aa32d9d4d",
                children: ".dashboard.jsx-60d7291aa32d9d4d{max-width:1400px;margin:0 auto;padding:24px;font-family:system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Noto Sans,Ubuntu,Cantarell,Helvetica Neue,sans-serif}.dashboard-header.jsx-60d7291aa32d9d4d{text-align:center;margin-bottom:32px;position:relative}.dashboard-header.jsx-60d7291aa32d9d4d h1.jsx-60d7291aa32d9d4d{color:#1a237e;margin:0;font-size:28px}.subtitle.jsx-60d7291aa32d9d4d{color:#666;margin:8px 0}.header-actions.jsx-60d7291aa32d9d4d{gap:12px;display:flex;position:absolute;top:0;right:0}.refresh-btn.jsx-60d7291aa32d9d4d{color:#fff;cursor:pointer;background:#1976d2;border:none;border-radius:6px;padding:8px 16px}.arc-btn.jsx-60d7291aa32d9d4d{color:#fff;background:#2563eb;border-radius:6px;padding:8px 16px;font-size:14px;font-weight:600;text-decoration:none;box-shadow:0 2px 4px #2563eb33}.arc-btn.jsx-60d7291aa32d9d4d:hover{background:#1d4ed8}.summary-cards.jsx-60d7291aa32d9d4d{grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;margin-bottom:32px;display:grid}.card.jsx-60d7291aa32d9d4d{background:#fff;border-radius:12px;align-items:center;gap:16px;padding:20px;display:flex;box-shadow:0 2px 8px #00000014}.card.delayed.jsx-60d7291aa32d9d4d{border-left:4px solid #ef6c00}.card.critical.jsx-60d7291aa32d9d4d{border-left:4px solid #c62828}.card-icon.jsx-60d7291aa32d9d4d{font-size:32px}.card-value.jsx-60d7291aa32d9d4d{color:#333;font-size:24px;font-weight:700}.card-label.jsx-60d7291aa32d9d4d{color:#666;font-size:13px}.section.jsx-60d7291aa32d9d4d{background:#fff;border-radius:12px;margin-bottom:24px;padding:24px;box-shadow:0 2px 8px #00000014}.section.jsx-60d7291aa32d9d4d h2.jsx-60d7291aa32d9d4d{color:#333;margin:0 0 20px;font-size:20px}.province-grid.jsx-60d7291aa32d9d4d{grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;display:grid}.province-card.jsx-60d7291aa32d9d4d{border-left:4px solid;border-radius:8px;padding:16px}.province-header.jsx-60d7291aa32d9d4d{justify-content:space-between;align-items:center;margin-bottom:12px;display:flex}.province-header.jsx-60d7291aa32d9d4d h3.jsx-60d7291aa32d9d4d{margin:0;font-size:16px}.status-badge.jsx-60d7291aa32d9d4d{color:#fff;border-radius:4px;padding:4px 8px;font-size:11px}.province-stats.jsx-60d7291aa32d9d4d{justify-content:space-between;margin-bottom:12px;display:flex}.stat.jsx-60d7291aa32d9d4d{text-align:center}.stat-value.jsx-60d7291aa32d9d4d{font-size:18px;font-weight:600;display:block}.stat-label.jsx-60d7291aa32d9d4d{color:#666;font-size:11px}.progress-bar.jsx-60d7291aa32d9d4d{background:#0000001a;border-radius:3px;height:6px;overflow:hidden}.progress-fill.jsx-60d7291aa32d9d4d{height:100%;transition:width .5s}.alert-section.jsx-60d7291aa32d9d4d{background:#fff8e1}.alert-list.jsx-60d7291aa32d9d4d{flex-direction:column;gap:12px;display:flex}.alert-item.jsx-60d7291aa32d9d4d{border-radius:8px;justify-content:space-between;align-items:center;padding:16px;display:flex}.alert-info.jsx-60d7291aa32d9d4d h4.jsx-60d7291aa32d9d4d{margin:0;font-size:14px}.alert-province.jsx-60d7291aa32d9d4d{color:#666;margin:0;font-size:12px}.alert-progress.jsx-60d7291aa32d9d4d{text-align:center}.progress-actual.jsx-60d7291aa32d9d4d{color:#333;font-weight:600}.progress-separator.jsx-60d7291aa32d9d4d{color:#999;margin:0 4px}.progress-planned.jsx-60d7291aa32d9d4d{color:#666}.alert-variance.jsx-60d7291aa32d9d4d{font-size:16px;font-weight:700}.alert-days.jsx-60d7291aa32d9d4d{color:#666;margin:0 12px;font-size:12px}.alert-actions.jsx-60d7291aa32d9d4d{flex-direction:column;align-items:flex-end;gap:8px;display:flex}.report-link.jsx-60d7291aa32d9d4d{color:#fff;background:#2563eb;border:1px solid #2563eb;border-radius:6px;align-items:center;gap:4px;padding:4px 10px;font-size:12px;font-weight:600;text-decoration:none;display:inline-flex;box-shadow:0 1px 3px #0000001a}.report-link.secondary.jsx-60d7291aa32d9d4d{color:#475569;background:#fff;border-color:#e2e8f0}.report-link.jsx-60d7291aa32d9d4d:hover{opacity:.9;transform:translateY(-1px)}.report-link.secondary.jsx-60d7291aa32d9d4d:hover{color:#1e293b;background:#f8fafc;border-color:#cbd5e1}.dashboard-loading.jsx-60d7291aa32d9d4d,.dashboard-error.jsx-60d7291aa32d9d4d{text-align:center;padding:60px}.spinner.jsx-60d7291aa32d9d4d{font-size:48px}"
            }, void 0, false, void 0, this)
        ]
    }, void 0, true, {
        fileName: "[project]/OneDrive/Apps/detctDrawing/src/app/dashboard/page.tsx",
        lineNumber: 90,
        columnNumber: 9
    }, this);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__c58ef97c._.js.map