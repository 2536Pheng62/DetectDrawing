'use client';

/**
 * SCurvePreview - แสดงแผนภาพ S-Curve แบบย่อ (SVG)
 * @param planned - รายการความคืบหน้าตามแผน [0-100]
 * @param actual - รายการความคืบหน้าจริง [0-100]
 */
export function SCurvePreview({ planned = [], actual = [], width = 120, height = 40 }: {
    planned?: number[],
    actual?: number[],
    width?: number,
    height?: number
}) {
    // ถ้าไม่มีข้อมูล ให้สร้างตัวอย่าง (Mock) เพื่อความสวยงาม
    const defaultPlanned = [0, 10, 25, 45, 70, 90, 100];
    const defaultActual = [0, 8, 20, 35];

    const pData = planned.length > 0 ? planned : defaultPlanned;
    const aData = actual.length > 0 ? actual : defaultActual;

    const getPath = (data: number[]) => {
        if (data.length < 2) return "";
        const points = data.map((val, i) => {
            const x = (i / (pData.length - 1)) * width;
            const y = height - (val / 100) * height;
            return `${x},${y}`;
        }).join(" ");
        return points;
    };

    return (
        <svg width={width} height={height} className="s-curve-preview">
            <polyline
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="2"
                strokeDasharray="4,2"
                points={getPath(pData)}
            />
            <polyline
                fill="none"
                stroke="#2563eb"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={getPath(aData)}
            />
            <style jsx>{`
                .s-curve-preview {
                    filter: drop-shadow(0 2px 4px rgba(37, 99, 235, 0.1));
                }
            `}</style>
        </svg>
    );
}
