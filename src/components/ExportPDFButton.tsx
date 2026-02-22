'use client';

import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { ReportPDF } from './pdf/ReportPDF';
import { PhotoPagePDF } from './pdf/PhotoPagePDF';
import { UnifiedReportPDF } from './pdf/UnifiedReportPDF';

interface WorkItem {
    task_name: string;
    unit: string;
    planned_quantity: number;
    actual_quantity: number;
    progress_percent: number;
    weight?: number;
}

interface Photo {
    id: string;
    file_url: string;
    caption?: string;
    latitude?: number;
    longitude?: number;
    taken_at?: string;
}

interface ReportData {
    projectName: string;
    contractNumber?: string;
    contractorName?: string;
    provinceName?: string;
    reportDate: string;
    reportNumber?: number;
    weather: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
    temperature?: number;
    humidity?: number;
    workSummary: string;
    issues?: string;
    laborCount: number;
    equipmentNotes?: string;
    workItems: WorkItem[];
    totalProgress: number;
    plannedProgress?: number;
    inspectorName?: string;
    contractorSigneeName?: string;
    approverName?: string;
}

interface ExportPDFButtonProps {
    reportData: ReportData;
    photos?: Photo[];
    includePhotos?: boolean;
    fileName?: string;
    disabled?: boolean;
}

/**
 * ปุ่ม Export PDF สำหรับรายงานควบคุมงาน
 * - Export เฉพาะรายงาน หรือรวมรูปถ่าย
 * - ดาวน์โหลดเป็นไฟล์ PDF
 */
export function ExportPDFButton({
    reportData,
    photos = [],
    includePhotos = true,
    fileName,
    disabled = false,
}: ExportPDFButtonProps) {
    const [isExporting, setIsExporting] = useState(false);

    const generateFileName = () => {
        if (fileName) return fileName;
        const date = reportData.reportDate.replace(/-/g, '');
        const projectSlug = reportData.projectName
            .replace(/[^a-zA-Z0-9ก-๙]/g, '_')
            .substring(0, 30);
        return `รายงาน_${projectSlug}_${date}.pdf`;
    };

    const handleExport = async () => {
        setIsExporting(true);

        try {
            // สร้าง PDF Document แบบรวม (Unified)
            const unifiedBlob = await pdf(
                <UnifiedReportPDF
                    reportData={reportData}
                    photos={includePhotos ? photos : []}
                />
            ).toBlob();

            downloadBlob(unifiedBlob, generateFileName());
        } catch (error) {
            console.error('PDF Export failed:', error);
            alert('เกิดข้อผิดพลาดในการสร้าง PDF');
        } finally {
            setIsExporting(false);
        }
    };

    const downloadBlob = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <button
            onClick={handleExport}
            disabled={isExporting || disabled}
            className="export-pdf-btn"
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: isExporting
                    ? '#9e9e9e'
                    : 'linear-gradient(135deg, #c62828 0%, #b71c1c 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: isExporting || disabled ? 'not-allowed' : 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
            }}
        >
            {isExporting ? (
                <>
                    <span>⏳</span>
                    <span>กำลังสร้าง PDF...</span>
                </>
            ) : (
                <>
                    <span>📄</span>
                    <span>Export PDF</span>
                </>
            )}
        </button>
    );
}

/**
 * Preview รายงานก่อน Export
 */
export function PreviewPDFButton({
    reportData,
    photos = [],
}: {
    reportData: ReportData;
    photos?: Photo[];
}) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handlePreview = async () => {
        setIsGenerating(true);

        try {
            const blob = await pdf(
                <UnifiedReportPDF
                    reportData={reportData}
                    photos={photos}
                />
            ).toBlob();
            const url = URL.createObjectURL(blob);
            setPreviewUrl(url);
            window.open(url, '_blank');
        } catch (error) {
            console.error('Preview failed:', error);
            alert('เกิดข้อผิดพลาดในการแสดงตัวอย่าง');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <button
            onClick={handlePreview}
            disabled={isGenerating}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: 'white',
                color: '#1976d2',
                border: '2px solid #1976d2',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: isGenerating ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
            }}
        >
            {isGenerating ? (
                <>
                    <span>⏳</span>
                    <span>กำลังโหลด...</span>
                </>
            ) : (
                <>
                    <span>👁️</span>
                    <span>ดูตัวอย่าง</span>
                </>
            )}
        </button>
    );
}

export default ExportPDFButton;
