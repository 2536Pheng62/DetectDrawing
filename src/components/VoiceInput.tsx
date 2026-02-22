'use client';

import { useState, useRef } from 'react';
import { isSpeechRecognitionSupported, startSpeechRecognition } from '@/lib/speech';

interface VoiceInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label: string;
    rows?: number;
    disabled?: boolean;
}

/**
 * Component TextArea พร้อมปุ่ม Record เสียง
 * - ใช้ Web Speech API แปลงเสียงภาษาไทยเป็นข้อความ
 * - ต่อท้ายข้อความเดิมอัตโนมัติ
 */
export function VoiceInput({
    value,
    onChange,
    placeholder = 'พิมพ์หรือพูดเพื่อบันทึก...',
    label,
    rows = 4,
    disabled = false,
}: VoiceInputProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const isSupported = isSpeechRecognitionSupported();

    const handleRecord = async () => {
        if (!isSupported || isRecording) return;

        setIsRecording(true);
        setError(null);

        try {
            const result = await startSpeechRecognition();

            // ต่อท้ายข้อความเดิม
            const newValue = value
                ? `${value} ${result.transcript}`
                : result.transcript;

            onChange(newValue);

            // Focus และ scroll ไปท้ายสุด
            if (textareaRef.current) {
                textareaRef.current.focus();
                textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด';
            setError(errorMessage);
            setTimeout(() => setError(null), 3000);
        } finally {
            setIsRecording(false);
        }
    };

    return (
        <div className="voice-input">
            <div className="voice-input-header">
                <label className="voice-input-label">{label}</label>
                {isSupported && (
                    <button
                        type="button"
                        onClick={handleRecord}
                        disabled={isRecording || disabled}
                        className={`voice-record-btn ${isRecording ? 'recording' : ''}`}
                        title={isRecording ? 'กำลังฟัง...' : 'กดเพื่ออัดเสียง'}
                    >
                        {isRecording ? (
                            <span className="recording-indicator">🔴 กำลังฟัง...</span>
                        ) : (
                            <span>🎤 พูด</span>
                        )}
                    </button>
                )}
            </div>

            <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={rows}
                disabled={disabled}
                className="voice-input-textarea"
            />

            {error && (
                <div className="voice-input-error">
                    ⚠️ {error}
                </div>
            )}

            {!isSupported && (
                <div className="voice-input-unsupported">
                    💡 เบราว์เซอร์นี้ไม่รองรับ Voice Input (แนะนำ Chrome)
                </div>
            )}

            <style jsx>{`
                .voice-input {
                    margin-bottom: 16px;
                }
                .voice-input-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }
                .voice-input-label {
                    font-weight: 600;
                    color: #37474f;
                }
                .voice-record-btn {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 6px 12px;
                    border: 2px solid #1976d2;
                    background: white;
                    color: #1976d2;
                    border-radius: 20px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    transition: all 0.2s;
                }
                .voice-record-btn:hover:not(:disabled) {
                    background: #1976d2;
                    color: white;
                }
                .voice-record-btn.recording {
                    background: #c62828;
                    border-color: #c62828;
                    color: white;
                    animation: pulse 1.5s infinite;
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                .recording-indicator {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .voice-input-textarea {
                    width: 100%;
                    padding: 12px;
                    border: 2px solid #e0e0e0;
                    border-radius: 8px;
                    font-size: 16px;
                    line-height: 1.5;
                    resize: vertical;
                    font-family: inherit;
                    transition: border-color 0.2s;
                }
                .voice-input-textarea:focus {
                    outline: none;
                    border-color: #1976d2;
                }
                .voice-input-textarea:disabled {
                    background: #f5f5f5;
                    cursor: not-allowed;
                }
                .voice-input-error {
                    color: #c62828;
                    font-size: 13px;
                    margin-top: 6px;
                }
                .voice-input-unsupported {
                    color: #78909c;
                    font-size: 12px;
                    margin-top: 6px;
                }
            `}</style>
        </div>
    );
}

export default VoiceInput;
