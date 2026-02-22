'use client';

import { useState, useRef } from 'react';
import AutoWeather from './AutoWeather';
import VoiceInput from './VoiceInput';
import { compressImage } from '@/lib/image-compression';

interface WeatherData {
    weather: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
    temperature: number;
    humidity: number;
    description: string;
}

export interface WorkItemEntry {
    milestone_id?: string;
    task_name: string;
    unit: string;
    planned_quantity: number;
    actual_quantity: number;
    weight: number;
}

export interface PhotoEntry {
    file: File;
    caption: string;
    latitude?: number;
    longitude?: number;
    previewUrl: string;
}

interface ReportFormData {
    reportDate: string;
    weather: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
    temperature: number | null;
    humidity: number | null;
    workSummary: string;
    issues: string;
    laborCount: number;
    equipmentNotes: string;
}

interface DailyReportFormProps {
    projectId: string;
    projectName: string;
    projectLat?: number | null;
    projectLon?: number | null;
    initialWorkItems?: WorkItemEntry[];
    onSubmit: (data: ReportFormData, workItems: WorkItemEntry[], photos: PhotoEntry[]) => void;
    initialData?: Partial<ReportFormData>;
}

/**
 * ฟอร์มรายงานประจำวัน (Enhanced)
 * รองรับ:
 * - รายการงาน (Work Items)
 * - การถ่ายภาพ/อัปโหลดรูปภาพ พร้อมบีบอัด
 * - Auto Weather + Voice Input
 */
export function DailyReportForm({
    projectId,
    projectName,
    projectLat,
    projectLon,
    initialWorkItems = [],
    onSubmit,
    initialData = {},
}: DailyReportFormProps) {
    const today = new Date().toISOString().split('T')[0];
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<ReportFormData>({
        reportDate: initialData.reportDate || today,
        weather: initialData.weather || 'sunny',
        temperature: initialData.temperature ?? null,
        humidity: initialData.humidity ?? null,
        workSummary: initialData.workSummary || '',
        issues: initialData.issues || '',
        laborCount: initialData.laborCount || 0,
        equipmentNotes: initialData.equipmentNotes || '',
    });

    const [workItems, setWorkItems] = useState<WorkItemEntry[]>(initialWorkItems);
    const [photos, setPhotos] = useState<PhotoEntry[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [gpsStatus, setGpsStatus] = useState<{ lat?: number; lon?: number; accuracy?: number; status: 'idle' | 'locating' | 'success' | 'warning' | 'error' }>({ status: 'idle' });

    // Handle weather data
    const handleWeatherFetched = (data: WeatherData) => {
        setFormData((prev) => ({
            ...prev,
            weather: data.weather,
            temperature: data.temperature,
            humidity: data.humidity,
        }));
    };

    // Geolocation Helper
    const getHighAccuracyLocation = (): Promise<{ lat: number; lon: number; accuracy: number }> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('เบราว์เซอร์ไม่รองรับ GPS'));
                return;
            }

            setGpsStatus({ status: 'locating' });

            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude, accuracy } = pos.coords;
                    if (accuracy > 20) {
                        setGpsStatus({ lat: latitude, lon: longitude, accuracy, status: 'warning' });
                    } else {
                        setGpsStatus({ lat: latitude, lon: longitude, accuracy, status: 'success' });
                    }
                    resolve({ lat: latitude, lon: longitude, accuracy });
                },
                (err) => {
                    setGpsStatus({ status: 'error' });
                    reject(err);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        });
    };

    // Handle work item changes
    const handleWorkItemChange = (index: number, value: number) => {
        const newItems = [...workItems];
        newItems[index].actual_quantity = value;
        setWorkItems(newItems);
    };

    // Handle photo selection
    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        let currentLoc: { lat?: number; lon?: number } = { lat: projectLat || undefined, lon: projectLon || undefined };

        try {
            const loc = await getHighAccuracyLocation();
            currentLoc = { lat: loc.lat, lon: loc.lon };
        } catch (err) {
            console.warn('GPS Error:', err);
        }

        const newPhotos: PhotoEntry[] = [];
        for (const file of files) {
            // บีบอัดรูปก่อนแสดง preview
            const compressed = await compressImage(file);
            newPhotos.push({
                file: compressed.file,
                caption: '',
                previewUrl: URL.createObjectURL(compressed.file),
                latitude: currentLoc.lat,
                longitude: currentLoc.lon,
            });
        }
        setPhotos([...photos, ...newPhotos]);
    };

    const removePhoto = (index: number) => {
        const newPhotos = [...photos];
        URL.revokeObjectURL(newPhotos[index].previewUrl);
        newPhotos.splice(index, 1);
        setPhotos(newPhotos);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // กรองความคืบหน้าที่เป็น 0 ออก หรือแจ้งเตือนถ้าไม่มีข้อมูลเลย
        const hasProgress = workItems.some(item => item.actual_quantity > 0);
        if (!hasProgress && !confirm('ยังไม่ได้ระบุความคืบหน้าของงาน ต้องการส่งรายงานต่อหรือไม่?')) {
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(formData, workItems, photos);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="daily-report-form">
            <div className="form-header">
                <h2>📋 รายงานประจำวัน</h2>
                <p className="project-name">{projectName}</p>
            </div>

            <div className="form-section">
                <h3>📍 ข้อมูลทั่วไป</h3>
                <div className="form-group">
                    <label>วันที่รายงาน</label>
                    <input
                        type="date"
                        title="วันที่รายงาน"
                        value={formData.reportDate}
                        max={today}
                        onChange={(e) => setFormData({ ...formData, reportDate: e.target.value })}
                        required
                    />
                </div>

                <AutoWeather
                    projectLat={projectLat}
                    projectLon={projectLon}
                    onWeatherFetched={handleWeatherFetched}
                />

                <div className="form-row">
                    <div className="form-group">
                        <label>สภาพอากาศ</label>
                        <select
                            title="สภาพอากาศ"
                            value={formData.weather}
                            onChange={(e) => setFormData({ ...formData, weather: e.target.value as ReportFormData['weather'] })}
                        >
                            <option value="sunny">☀️ แดดจ้า</option>
                            <option value="cloudy">☁️ มีเมฆ</option>
                            <option value="rainy">🌧️ ฝนตก</option>
                            <option value="stormy">⛈️ พายุฝน</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>อุณหภูมิ (°C)</label>
                        <input
                            type="number"
                            step="0.1"
                            title="อุณหภูมิ"
                            placeholder="อุณหภูมิ (°C)"
                            value={formData.temperature ?? ''}
                            onChange={(e) => setFormData({ ...formData, temperature: e.target.value ? parseFloat(e.target.value) : null })}
                        />
                    </div>
                    <div className="form-group">
                        <label>ความชื้น (%)</label>
                        <input
                            type="number"
                            title="ความชื้น"
                            placeholder="ความชื้น (%)"
                            value={formData.humidity ?? ''}
                            onChange={(e) => setFormData({ ...formData, humidity: e.target.value ? parseInt(e.target.value) : null })}
                        />
                    </div>
                </div>
            </div>

            {/* ส่วนรายการงาน */}
            <div className="form-section">
                <h3>📊 รายการงานที่ทำวันนี้</h3>
                <div className="work-items-list">
                    {workItems.length === 0 ? (
                        <p className="empty-msg">ไม่มีรายการงานที่ระบุไว้ในโครงการ</p>
                    ) : (
                        workItems.map((item, index) => (
                            <div key={index} className="work-item-row">
                                <div className="work-item-name">
                                    <strong>{item.task_name}</strong>
                                    <span>หน่วย: {item.unit} (แผน: {item.planned_quantity})</span>
                                </div>
                                <div className="work-item-input">
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="ปริมาณ (เมตร/ตร.ม./ลบ.ม.)"
                                        value={item.actual_quantity || ''}
                                        onChange={(e) => handleWorkItemChange(index, parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="form-section">
                <h3>👷 ข้อมูลหน้างาน</h3>
                <div className="form-group">
                    <label>จำนวนแรงงานวันนี้ (คน)</label>
                    <input
                        type="number"
                        min="0"
                        title="จำนวนแรงงาน"
                        placeholder="จำนวนคน"
                        value={formData.laborCount}
                        onChange={(e) => setFormData({ ...formData, laborCount: parseInt(e.target.value) || 0 })}
                    />
                </div>

                <VoiceInput
                    label="📝 สรุปผลงานวันนี้"
                    value={formData.workSummary}
                    onChange={(value) => setFormData({ ...formData, workSummary: value })}
                    placeholder="พิมพ์หรือกดปุ่มไมค์เพื่ออัดเสียง..."
                    rows={4}
                />

                <VoiceInput
                    label="⚠️ ปัญหา/อุปสรรค"
                    value={formData.issues}
                    onChange={(value) => setFormData({ ...formData, issues: value })}
                    placeholder="ระบุปัญหาที่พบ (ถ้ามี)"
                    rows={3}
                />

                <div className="form-group">
                    <label>🚜 หมายเหตุเครื่องจักร/อุปกรณ์</label>
                    <textarea
                        value={formData.equipmentNotes}
                        onChange={(e) => setFormData({ ...formData, equipmentNotes: e.target.value })}
                        placeholder="รายการเครื่องจักร/อุปกรณ์ที่ใช้"
                        rows={2}
                    />
                </div>
            </div>

            {/* ส่วนรูปภาพ */}
            <div className="form-section">
                <h3>📸 ภาพประกอบผลงาน</h3>
                <div className="photo-upload-container">
                    {/* GPS Status Indicator */}
                    <div className={`gps-indicator status-${gpsStatus.status}`}>
                        {gpsStatus.status === 'locating' && <span>🛰️ กำลังระบุพิกัด...</span>}
                        {gpsStatus.status === 'success' && <span>✅ พิกัดแม่นยำ (±{gpsStatus.accuracy?.toFixed(1)}ม.)</span>}
                        {gpsStatus.status === 'warning' && (
                            <span>⚠️ พิกัดคลาดเคลื่อนสูง (±{gpsStatus.accuracy?.toFixed(1)}ม.)
                                <button type="button" onClick={() => getHighAccuracyLocation()}>รีเฟรช</button>
                            </span>
                        )}
                        {gpsStatus.status === 'error' && <span>❌ ไม่สามารถดึงพิกัดได้ (กรุณาเปิด GPS)</span>}
                    </div>

                    <button
                        type="button"
                        className="photo-btn"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        📷 เพิ่มรูปภาพพร้อมพิกัด
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handlePhotoChange}
                        multiple
                        accept="image/*"
                        className="hidden-file-input"
                        title="อัปโหลดรูปภาพ"
                    />

                    <div className="photo-preview-grid">
                        {photos.map((photo, index) => (
                            <div key={index} className="photo-preview-card">
                                <img src={photo.previewUrl} alt="Preview" />
                                <button type="button" className="remove-photo" onClick={() => removePhoto(index)}>×</button>
                                <input
                                    type="text"
                                    placeholder="คำอธิบายภาพ..."
                                    value={photo.caption}
                                    onChange={(e) => {
                                        const newPhotos = [...photos];
                                        newPhotos[index].caption = e.target.value;
                                        setPhotos(newPhotos);
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Submit Section */}
            <div className="form-footer">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="submit-btn"
                >
                    {isSubmitting ? '⏳ กำลังบันทึกรายงาน...' : '💾 บันทึกและส่งรายงาน'}
                </button>
            </div>

            <style jsx>{`
                .daily-report-form {
                    max-width: 700px;
                    margin: 0 auto;
                    padding: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    padding-bottom: 40px;
                }
                .form-header {
                    text-align: center;
                    background: white;
                    padding: 32px;
                    border-radius: 20px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                }
                .form-header h2 { margin: 0; color: #1e293b; }
                .project-name { color: #64748b; margin: 8px 0 0; }

                .form-section {
                    background: white;
                    padding: 24px;
                    border-radius: 16px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                }
                .form-section h3 {
                    margin: 0 0 20px 0;
                    font-size: 16px;
                    color: #475569;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    border-bottom: 1px solid #f1f5f9;
                    padding-bottom: 12px;
                }

                .form-group { margin-bottom: 16px; }
                .form-group label { display: block; margin-bottom: 8px; font-weight: 600; font-size: 14px; color: #334155; }
                .form-group input, .form-group select, .form-group textarea {
                    width: 100%; padding: 12px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 16px; transition: border-color 0.2s;
                }
                .form-group input:focus { border-color: #2563eb; outline: none; }

                .form-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }

                .work-items-list { display: flex; flex-direction: column; gap: 12px; }
                .work-item-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px;
                    background: #f8fafc;
                    border-radius: 12px;
                    border: 1px solid #f1f5f9;
                }
                .work-item-name { display: flex; flex-direction: column; flex: 1; }
                .work-item-name strong { font-size: 14px; }
                .work-item-name span { font-size: 12px; color: #64748b; }
                .work-item-input input { width: 120px; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; text-align: right; }

                .photo-upload-container { display: flex; flex-direction: column; gap: 12px; }
                .gps-indicator {
                    font-size: 11px;
                    padding: 6px 10px;
                    border-radius: 6px;
                    background: #f8fafc;
                    display: inline-block;
                    width: fit-content;
                }
                .gps-indicator.status-locating { color: #2563eb; background: #eff6ff; }
                .gps-indicator.status-success { color: #16a34a; background: #f0fdf4; }
                .gps-indicator.status-warning { color: #d97706; background: #fffbeb; }
                .gps-indicator.status-error { color: #dc2626; background: #fef2f2; }
                .gps-indicator button {
                    margin-left: 8px;
                    background: none;
                    border: none;
                    color: inherit;
                    text-decoration: underline;
                    cursor: pointer;
                    font: inherit;
                    padding: 0;
                }

                .photo-btn {
                    padding: 12px 24px;
                    background: #f1f5f9;
                    border: 2px dashed #cbd5e1;
                    border-radius: 12px;
                    color: #475569;
                    font-weight: 600;
                    cursor: pointer;
                    width: 100%;
                }
                .hidden-file-input { display: none; }
                .photo-preview-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
                    gap: 12px;
                    margin-top: 20px;
                }
                .photo-preview-card {
                    position: relative;
                    border-radius: 12px;
                    overflow: hidden;
                    border: 1px solid #e2e8f0;
                }
                .photo-preview-card img { width: 100%; height: 100px; object-fit: cover; }
                .photo-preview-card input { width: 100%; border: none; padding: 6px; font-size: 11px; }
                .remove-photo {
                    position: absolute; top: 4px; right: 4px;
                    background: rgba(0,0,0,0.5); color: white; border: none;
                    border-radius: 50%; width: 20px; height: 20px; cursor: pointer;
                }

                .submit-btn {
                    width: 100%;
                    padding: 18px;
                    background: #2563eb;
                    color: white;
                    border: none;
                    border-radius: 16px;
                    font-size: 18px;
                    font-weight: 700;
                    cursor: pointer;
                    box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);
                    transition: transform 0.2s;
                }
                .submit-btn:hover { transform: translateY(-2px); }
                .submit-btn:disabled { opacity: 0.7; transform: none; }
                .empty-msg { text-align: center; color: #94a3b8; font-style: italic; }
            `}</style>
        </form>
    );
}

export default DailyReportForm;
