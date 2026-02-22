// Voice-to-Text: ใช้ Browser Speech Recognition API
// สำหรับบันทึกเสียงขณะตรวจหน้างาน

interface SpeechRecognitionResult {
    transcript: string;
    confidence: number;
}

// ตรวจสอบว่า Browser รองรับ Speech Recognition หรือไม่
export function isSpeechRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;

    return !!(
        (window as { SpeechRecognition?: unknown }).SpeechRecognition ||
        (window as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
    );
}

/**
 * สร้าง Speech Recognition instance
 * @returns SpeechRecognition instance หรือ null
 */
function createSpeechRecognition(): any | null {
    if (typeof window === 'undefined') return null;

    const SpeechRecognition = (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.lang = 'th-TH'; // ภาษาไทย
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    return recognition;
}

/**
 * เริ่มการอัดเสียงและแปลงเป็นข้อความ
 * @returns Promise<string> ข้อความที่แปลงได้
 */
export function startSpeechRecognition(): Promise<SpeechRecognitionResult> {
    return new Promise((resolve, reject) => {
        const recognition = createSpeechRecognition();

        if (!recognition) {
            reject(new Error('Browser ไม่รองรับ Speech Recognition'));
            return;
        }

        recognition.onresult = (event: any) => {
            const result = event.results[0][0];
            resolve({
                transcript: result.transcript,
                confidence: result.confidence,
            });
        };

        recognition.onerror = (event: any) => {
            let message = 'เกิดข้อผิดพลาด';
            switch (event.error) {
                case 'no-speech':
                    message = 'ไม่พบเสียงพูด';
                    break;
                case 'audio-capture':
                    message = 'ไม่สามารถเข้าถึงไมโครโฟน';
                    break;
                case 'not-allowed':
                    message = 'ไม่ได้รับอนุญาตใช้ไมโครโฟน';
                    break;
                case 'network':
                    message = 'ไม่มีการเชื่อมต่อเครือข่าย';
                    break;
            }
            reject(new Error(message));
        };

        recognition.onend = () => {
            // จะถูกเรียกเมื่อหยุดฟัง
        };

        recognition.start();
    });
}

/**
 * React Hook สำหรับใช้ Speech Recognition
 */
export function useSpeechRecognition() {
    const isSupported = isSpeechRecognitionSupported();

    const listen = async (): Promise<string> => {
        if (!isSupported) {
            throw new Error('ไม่รองรับ Speech Recognition');
        }

        const result = await startSpeechRecognition();
        return result.transcript;
    };

    return {
        isSupported,
        listen,
    };
}
