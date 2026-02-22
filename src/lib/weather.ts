// ดึงข้อมูลสภาพอากาศอัตโนมัติจาก Open-Meteo API
// ฟรี 100% ไม่ต้อง API Key (10,000 requests/day)
// https://open-meteo.com/

interface WeatherData {
    weather: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
    temperature: number;
    humidity: number;
    description: string;
}

// Mapping WMO Weather Codes to our weather types
// https://open-meteo.com/en/docs#weathervariables
const WMO_WEATHER_MAP: Record<number, { type: 'sunny' | 'cloudy' | 'rainy' | 'stormy'; desc: string }> = {
    0: { type: 'sunny', desc: 'ท้องฟ้าแจ่มใส' },
    1: { type: 'sunny', desc: 'ส่วนใหญ่แจ่มใส' },
    2: { type: 'cloudy', desc: 'มีเมฆบางส่วน' },
    3: { type: 'cloudy', desc: 'มีเมฆมาก' },
    45: { type: 'cloudy', desc: 'หมอก' },
    48: { type: 'cloudy', desc: 'หมอกแข็งตัว' },
    51: { type: 'rainy', desc: 'ฝนปรอยเล็กน้อย' },
    53: { type: 'rainy', desc: 'ฝนปรอยปานกลาง' },
    55: { type: 'rainy', desc: 'ฝนปรอยหนาแน่น' },
    56: { type: 'rainy', desc: 'ฝนเยือกแข็งเล็กน้อย' },
    57: { type: 'rainy', desc: 'ฝนเยือกแข็งหนาแน่น' },
    61: { type: 'rainy', desc: 'ฝนเล็กน้อย' },
    63: { type: 'rainy', desc: 'ฝนปานกลาง' },
    65: { type: 'rainy', desc: 'ฝนตกหนัก' },
    66: { type: 'rainy', desc: 'ฝนเยือกแข็งเล็กน้อย' },
    67: { type: 'rainy', desc: 'ฝนเยือกแข็งหนัก' },
    71: { type: 'rainy', desc: 'หิมะเล็กน้อย' },
    73: { type: 'rainy', desc: 'หิมะปานกลาง' },
    75: { type: 'rainy', desc: 'หิมะหนัก' },
    77: { type: 'rainy', desc: 'เกล็ดหิมะ' },
    80: { type: 'rainy', desc: 'ฝนซาเล็กน้อย' },
    81: { type: 'rainy', desc: 'ฝนซาปานกลาง' },
    82: { type: 'stormy', desc: 'ฝนซารุนแรง' },
    85: { type: 'rainy', desc: 'หิมะตกเล็กน้อย' },
    86: { type: 'rainy', desc: 'หิมะตกหนัก' },
    95: { type: 'stormy', desc: 'พายุฝนฟ้าคะนอง' },
    96: { type: 'stormy', desc: 'พายุฝนฟ้าคะนองมีลูกเห็บเล็กน้อย' },
    99: { type: 'stormy', desc: 'พายุฝนฟ้าคะนองมีลูกเห็บหนัก' },
};

/**
 * ดึงข้อมูลสภาพอากาศจาก Open-Meteo API (ฟรี ไม่ต้อง API Key)
 * @param lat - ละติจูด
 * @param lon - ลองจิจูด
 * @returns ข้อมูลสภาพอากาศ หรือ null ถ้าล้มเหลว
 */
export async function fetchWeather(lat: number, lon: number): Promise<WeatherData | null> {
    try {
        // Open-Meteo API - ไม่ต้อง API Key
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=auto`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Weather API error: ${response.status}`);
        }

        const data = await response.json();
        const current = data.current;

        // Get weather type and description from WMO code
        const weatherCode = current?.weather_code ?? 0;
        const weatherInfo = WMO_WEATHER_MAP[weatherCode] || { type: 'cloudy', desc: 'ไม่ทราบ' };

        return {
            weather: weatherInfo.type,
            temperature: Math.round((current?.temperature_2m ?? 0) * 10) / 10,
            humidity: current?.relative_humidity_2m ?? 0,
            description: weatherInfo.desc,
        };
    } catch (error) {
        console.error('ดึงข้อมูลสภาพอากาศล้มเหลว:', error);
        return null;
    }
}

/**
 * ดึงตำแหน่ง GPS ปัจจุบันของผู้ใช้
 * @returns Promise<{lat, lon}> หรือ null ถ้าล้มเหลว
 */
export function getCurrentPosition(): Promise<{ lat: number; lon: number } | null> {
    return new Promise((resolve) => {
        if (typeof window === 'undefined' || !navigator.geolocation) {
            console.warn('Browser ไม่รองรับ Geolocation');
            resolve(null);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                });
            },
            (error) => {
                console.warn('ไม่สามารถดึงตำแหน่งได้:', error.message);
                resolve(null);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000, // Cache 5 นาที
            }
        );
    });
}

/**
 * ดึงข้อมูลสภาพอากาศจากตำแหน่งปัจจุบัน
 * @returns ข้อมูลสภาพอากาศ หรือ null
 */
export async function fetchWeatherFromCurrentLocation(): Promise<WeatherData | null> {
    const position = await getCurrentPosition();

    if (!position) {
        return null;
    }

    return fetchWeather(position.lat, position.lon);
}

/**
 * ดึงข้อมูลสภาพอากาศจากพิกัดโครงการ
 * @param projectLat - ละติจูดของโครงการ
 * @param projectLon - ลองจิจูดของโครงการ
 * @returns ข้อมูลสภาพอากาศ หรือ null
 */
export async function fetchWeatherFromProject(
    projectLat: number | null | undefined,
    projectLon: number | null | undefined
): Promise<WeatherData | null> {
    // ถ้ามีพิกัดโครงการ ใช้พิกัดโครงการ
    if (projectLat && projectLon) {
        return fetchWeather(projectLat, projectLon);
    }

    // ถ้าไม่มี ใช้ตำแหน่งปัจจุบัน
    return fetchWeatherFromCurrentLocation();
}

