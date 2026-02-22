// Image Compression: ย่อรูปอัตโนมัติก่อน Upload
// ประหยัด Data และเพิ่มความเร็วในที่สัญญาณต่ำ

import imageCompression from 'browser-image-compression';

interface CompressionOptions {
    maxSizeMB?: number;
    maxWidthOrHeight?: number;
    useWebWorker?: boolean;
}

interface CompressedImage {
    file: File;
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
}

// Default options สำหรับรูปหน้างานก่อสร้าง
const DEFAULT_OPTIONS: CompressionOptions = {
    maxSizeMB: 1, // ไม่เกิน 1 MB
    maxWidthOrHeight: 1920, // ความกว้างสูงสุด 1920px
    useWebWorker: true, // ใช้ Web Worker เพื่อไม่ให้ UI ค้าง
};

/**
 * บีบอัดรูปภาพก่อน Upload
 * @param file - ไฟล์รูปภาพ
 * @param options - ตัวเลือกการบีบอัด
 * @returns ไฟล์ที่บีบอัดแล้วพร้อมข้อมูลขนาด
 */
export async function compressImage(
    file: File,
    options: CompressionOptions = {}
): Promise<CompressedImage> {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    const originalSize = file.size;

    try {
        const compressedFile = await imageCompression(file, mergedOptions);
        const compressedSize = compressedFile.size;

        return {
            file: compressedFile,
            originalSize,
            compressedSize,
            compressionRatio: Math.round((1 - compressedSize / originalSize) * 100),
        };
    } catch (error) {
        console.error('บีบอัดรูปภาพล้มเหลว:', error);
        // ถ้าบีบอัดล้มเหลว ส่งไฟล์เดิมกลับไป
        return {
            file,
            originalSize,
            compressedSize: originalSize,
            compressionRatio: 0,
        };
    }
}

/**
 * บีบอัดหลายรูปพร้อมกัน
 * @param files - รายการไฟล์รูปภาพ
 * @param options - ตัวเลือกการบีบอัด
 * @returns รายการไฟล์ที่บีบอัดแล้ว
 */
export async function compressImages(
    files: File[],
    options: CompressionOptions = {}
): Promise<CompressedImage[]> {
    const results = await Promise.all(
        files.map(file => compressImage(file, options))
    );
    return results;
}

/**
 * ดึง EXIF metadata จากรูปภาพ (Lat/Long, Timestamp)
 * @param file - ไฟล์รูปภาพ
 * @returns Metadata หรือ null
 */
export async function extractImageMetadata(file: File): Promise<{
    latitude?: number;
    longitude?: number;
    datetime?: string;
} | null> {
    return new Promise((resolve) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const view = new DataView(e.target?.result as ArrayBuffer);

                // ตรวจสอบว่าเป็น JPEG หรือไม่
                if (view.getUint16(0, false) !== 0xFFD8) {
                    resolve(null);
                    return;
                }

                // หา EXIF marker
                let offset = 2;
                while (offset < view.byteLength) {
                    const marker = view.getUint16(offset, false);
                    offset += 2;

                    if (marker === 0xFFE1) {
                        // EXIF marker found
                        // สำหรับ production ควรใช้ library เช่น exif-js
                        resolve(null);
                        return;
                    }

                    const length = view.getUint16(offset, false);
                    offset += length;
                }

                resolve(null);
            } catch {
                resolve(null);
            }
        };

        reader.onerror = () => resolve(null);
        reader.readAsArrayBuffer(file.slice(0, 128 * 1024)); // อ่านแค่ 128KB แรก
    });
}

/**
 * แปลงขนาดไฟล์เป็น format ที่อ่านง่าย
 * @param bytes - ขนาดเป็น bytes
 * @returns ขนาดในรูปแบบ "1.5 MB"
 */
export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
