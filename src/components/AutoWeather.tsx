'use client';

import { useState, useEffect } from 'react';
import { fetchWeatherFromCurrentLocation, fetchWeatherFromProject } from '@/lib/weather';

interface WeatherData {
    weather: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
    temperature: number;
    humidity: number;
    description: string;
}

interface AutoWeatherProps {
    projectLat?: number | null;
    projectLon?: number | null;
    onWeatherFetched: (data: WeatherData) => void;
    disabled?: boolean;
}

// แปลง weather type เป็นภาษาไทย
const WEATHER_LABELS: Record<string, string> = {
    sunny: '☀️ แดดจ้า',
    cloudy: '☁️ มีเมฆ',
    rainy: '🌧️ ฝนตก',
    stormy: '⛈️ พายุฝน',
};

/**
 * Component สำหรับดึงสภาพอากาศอัตโนมัติ
 * - ขอสิทธิ์ Geolocation เมื่อเปิดหน้าฟอร์ม
 * - ดึงข้อมูลจาก OpenWeather API
 * - แสดงผลและส่งกลับ onWeatherFetched
 */
export function AutoWeather({
    projectLat,
    projectLon,
    onWeatherFetched,
    disabled = false,
}: AutoWeatherProps) {
    const [loading, setLoading] = useState(false);
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [error, setError] = useState<string | null>(null);

    // ดึงสภาพอากาศอัตโนมัติเมื่อ component mount
    useEffect(() => {
        if (disabled) return;
        fetchWeatherData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchWeatherData = async () => {
        setLoading(true);
        setError(null);

        try {
            let data: WeatherData | null;

            // ใช้พิกัดโครงการถ้ามี, ไม่งั้นใช้ GPS
            if (projectLat && projectLon) {
                data = await fetchWeatherFromProject(projectLat, projectLon);
            } else {
                data = await fetchWeatherFromCurrentLocation();
            }

            if (data) {
                setWeather(data);
                onWeatherFetched(data);
            } else {
                setError('ไม่สามารถดึงข้อมูลสภาพอากาศได้');
            }
        } catch (err) {
            setError('เกิดข้อผิดพลาดในการดึงสภาพอากาศ');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auto-weather">
            <div className="weather-header">
                <label className="weather-label">สภาพอากาศ</label>
                <button
                    type="button"
                    onClick={fetchWeatherData}
                    disabled={loading || disabled}
                    className="weather-refresh-btn"
                    title="รีเฟรชสภาพอากาศ"
                >
                    {loading ? '⏳' : '🔄'}
                </button>
            </div>

            {loading && (
                <div className="weather-loading">
                    กำลังดึงข้อมูลสภาพอากาศ...
                </div>
            )}

            {error && (
                <div className="weather-error">
                    ⚠️ {error}
                </div>
            )}

            {weather && !loading && (
                <div className="weather-result">
                    <div className="weather-main">
                        <span className="weather-type">{WEATHER_LABELS[weather.weather]}</span>
                        <span className="weather-temp">{weather.temperature}°C</span>
                        <span className="weather-humidity">💧 {weather.humidity}%</span>
                    </div>
                    <div className="weather-desc">{weather.description}</div>
                </div>
            )}

            <style jsx>{`
                .auto-weather {
                    padding: 12px;
                    background: linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%);
                    border-radius: 12px;
                    margin-bottom: 16px;
                }
                .weather-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }
                .weather-label {
                    font-weight: 600;
                    color: #00695c;
                }
                .weather-refresh-btn {
                    padding: 4px 8px;
                    border: none;
                    background: white;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 16px;
                    transition: transform 0.2s;
                }
                .weather-refresh-btn:hover:not(:disabled) {
                    transform: rotate(180deg);
                }
                .weather-loading {
                    color: #00695c;
                    font-size: 14px;
                }
                .weather-error {
                    color: #c62828;
                    font-size: 14px;
                }
                .weather-result {
                    margin-top: 8px;
                }
                .weather-main {
                    display: flex;
                    gap: 16px;
                    align-items: center;
                    font-size: 18px;
                    font-weight: 500;
                }
                .weather-temp {
                    color: #e65100;
                }
                .weather-humidity {
                    color: #0277bd;
                }
                .weather-desc {
                    color: #546e7a;
                    font-size: 14px;
                    margin-top: 4px;
                }
            `}</style>
        </div>
    );
}

export default AutoWeather;
