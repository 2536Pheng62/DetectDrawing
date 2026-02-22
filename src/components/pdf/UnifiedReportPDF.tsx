/**
 * คอมโพเนนต์สำหรับสร้างเอกสาร PDF ชุดรวม (Unified Report)
 * - หน้าแรก: รายละเอียดรายงาน, สภาพอากาศ, รายการงานที่ทำและความคืบหน้า
 * - หน้าถัดไป: หน้าแสดงรูปถ่ายประกอบพร้อมพิกัด GPS และคำบรรยาย
 * - ใช้มาตรฐานฟอนต์ Helvetica (สามารถปรับเพิ่มฟอนต์ไทยได้ในภายหลัง)
 * - รูปแบบวันที่: DD/MM/YYYY ตามกฎโปรเจกต์
 */
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Image,
} from '@react-pdf/renderer';

// กำหนดสไตล์สำหรับเอกสาร PDF
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 12,
        fontFamily: 'Helvetica',
        lineHeight: 1.5,
    },
    header: {
        textAlign: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    headerSubtitle: {
        fontSize: 14,
        marginBottom: 3,
    },
    headerLine: {
        borderBottomWidth: 2,
        borderBottomColor: '#000',
        marginTop: 10,
        marginBottom: 15,
    },
    section: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        backgroundColor: '#e0e0e0',
        padding: 5,
        marginBottom: 8,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    label: {
        width: '30%',
        fontWeight: 'bold',
    },
    value: {
        width: '70%',
    },
    table: {
        marginTop: 10,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#333',
        color: '#fff',
        padding: 5,
        fontWeight: 'bold',
        fontSize: 10,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        padding: 5,
        fontSize: 10,
    },
    tableRowAlt: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        padding: 5,
        fontSize: 10,
        backgroundColor: '#f9f9f9',
    },
    col1: { width: '5%', textAlign: 'center' },
    col2: { width: '35%' },
    col3: { width: '10%', textAlign: 'center' },
    col4: { width: '15%', textAlign: 'right' },
    col5: { width: '15%', textAlign: 'right' },
    col6: { width: '20%', textAlign: 'center' },
    summary: {
        marginTop: 15,
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
    },
    summaryTitle: {
        fontWeight: 'bold',
        marginBottom: 5,
    },
    signatureSection: {
        marginTop: 40,
        flexDirection: 'row',
        paddingBottom: 20,
    },
    signatureBox: {
        width: '33%',
        textAlign: 'center',
        padding: 5,
    },
    signatureLine: {
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        marginTop: 35,
        marginBottom: 5,
    },
    signatureLabel: {
        fontSize: 10,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        fontSize: 9,
        color: '#666',
    },
    weatherBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#e8f4fd',
        padding: 8,
        marginBottom: 15,
        borderRadius: 5,
    },
    weatherItem: {
        textAlign: 'center',
    },
    progressBar: {
        height: 15,
        backgroundColor: '#e0e0e0',
        borderRadius: 3,
        marginTop: 5,
    },
    progressFill: {
        height: 15,
        backgroundColor: '#4caf50',
        borderRadius: 3,
    },
    // Styles สำหรับหน้า Photo
    photoHeader: {
        textAlign: 'center',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        paddingBottom: 10,
    },
    photoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    photoContainer: {
        width: '48%',
        marginBottom: 15,
        border: '1px solid #ddd',
        borderRadius: 5,
        overflow: 'hidden',
    },
    photo: {
        width: '100%',
        height: 150,
        objectFit: 'cover',
    },
    photoInfo: {
        padding: 8,
        backgroundColor: '#f5f5f5',
        fontSize: 9,
    },
    photoCaption: {
        fontWeight: 'bold',
        marginBottom: 3,
    },
    photoMeta: {
        color: '#666',
        lineHeight: 1.4,
    },
    pageNumber: {
        position: 'absolute',
        bottom: 20,
        right: 30,
        fontSize: 10,
        color: '#333',
    },
});

const WEATHER_LABELS: Record<string, string> = {
    sunny: 'แดดจ้า ☀️',
    cloudy: 'มีเมฆ ☁️',
    rainy: 'ฝนตก 🌧️',
    stormy: 'พายุฝน ⛈️',
};

interface WorkItem {
    task_name: string;
    unit: string;
    planned_quantity: number;
    actual_quantity: number;
    progress_percent: number;
    weight?: number;
}

// อินเทอร์เฟซสำหรับข้อมูลรูปถ่าย
interface Photo {
    id: string;
    file_url: string;
    caption?: string;
    latitude?: number;
    longitude?: number;
    taken_at?: string;
}

// พร็อพส์สำหรับ UnifiedReportPDF
interface UnifiedReportPDFProps {
    reportData: any; // ข้อมูลรายงานจาก daily_reports
    photos: Photo[]; // รายการรูปถ่ายแนบ
    logoUrl?: string; // URL ของโลโก้หน่วยงาน (ถ้ามี)
}

/**
 * ฟังก์ชันหลักสำหรับการเรนเดอร์ PDF
 */
export function UnifiedReportPDF({ reportData, photos, logoUrl }: UnifiedReportPDFProps) {
    /**
     * แปลงวันที่เป็นรูปแบบ DD/MM/YYYY (พ.ศ.)
     */
    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const d = date.getDate().toString().padStart(2, '0');
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const y = (date.getFullYear() + 543).toString(); // ปี พ.ศ.
        return `${d}/${m}/${y}`;
    };

    const formatDateTime = (dateString?: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const d = date.getDate().toString().padStart(2, '0');
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const y = (date.getFullYear() + 543).toString();
        const time = date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
        return `${d}/${m}/${y} ${time}`;
    };

    const formatGPS = (lat?: number, lon?: number) => {
        if (!lat || !lon) return null;
        return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
    };

    // แบ่งรูปเป็นหน้าๆ (4 รูปต่อหน้า)
    const photosPerPage = 4;
    const chunkedPhotos: Photo[][] = [];
    for (let i = 0; i < photos.length; i += photosPerPage) {
        chunkedPhotos.push(photos.slice(i, i + photosPerPage));
    }

    return (
        <Document>
            {/* Page 1: Main Report Content */}
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    {logoUrl && <Image src={logoUrl} style={{ width: 60, height: 60, marginBottom: 10, alignSelf: 'center' }} />}
                    <Text style={styles.headerTitle}>รายงานการควบคุมงานก่อสร้างประจำวัน (รวมรูปถ่าย)</Text>
                    <Text style={styles.headerSubtitle}>กองพัฒนาและบำรุงรักษาอาคารราชพัสดุ</Text>
                    <View style={styles.headerLine} />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ข้อมูลโครงการ</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>ชื่อโครงการ:</Text>
                        <Text style={styles.value}>{reportData.projectName}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>วันที่รายงาน:</Text>
                        <Text style={styles.value}>{formatDate(reportData.reportDate)}</Text>
                    </View>
                </View>

                <View style={styles.weatherBox}>
                    <View style={styles.weatherItem}>
                        <Text style={{ fontWeight: 'bold' }}>สภาพอากาศ</Text>
                        <Text>{WEATHER_LABELS[reportData.weather] || reportData.weather}</Text>
                    </View>
                    <View style={styles.weatherItem}>
                        <Text style={{ fontWeight: 'bold' }}>แรงงาน</Text>
                        <Text>{reportData.laborCount} คน</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>รายการงานที่ดำเนินการ</Text>
                    <View style={styles.table}>
                        <View style={styles.tableHeader}>
                            <Text style={styles.col1}>ลำดับ</Text>
                            <Text style={styles.col2}>รายการงาน</Text>
                            <Text style={styles.col3}>หน่วย</Text>
                            <Text style={styles.col6}>% ความคืบหน้า</Text>
                        </View>
                        {reportData.workItems.slice(0, 15).map((item: any, index: number) => (
                            <View key={index} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                                <Text style={styles.col1}>{index + 1}</Text>
                                <Text style={styles.col2}>{item.task_name}</Text>
                                <Text style={styles.col3}>{item.unit}</Text>
                                <Text style={styles.col6}>{item.progress_percent ? item.progress_percent.toFixed(2) : '0.00'}%</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.summary}>
                    <Text style={styles.summaryTitle}>สรุปผลงาน: {reportData.totalProgress ? reportData.totalProgress.toFixed(2) : '0.00'}%</Text>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${Math.min(reportData.totalProgress || 0, 100)}%` }]} />
                    </View>
                </View>

                <View style={styles.signatureSection}>
                    <View style={styles.signatureBox}>
                        <View style={styles.signatureLine} />
                        <Text style={styles.signatureLabel}>ผู้ควบคุมงาน</Text>
                    </View>
                    <View style={styles.signatureBox}>
                        <View style={styles.signatureLine} />
                        <Text style={styles.signatureLabel}>ผู้รับจ้าง</Text>
                    </View>
                    <View style={styles.signatureBox}>
                        <View style={styles.signatureLine} />
                        <Text style={styles.signatureLabel}>ผู้อนุมัติ</Text>
                    </View>
                </View>

                <Text style={styles.footer}>
                    หน้าที่ 1 | ข้อมูลรายงานชุดนี้รวมรูปแนบทั้งหมด {photos.length} รูป
                </Text>
            </Page>

            {/* Photo Pages */}
            {chunkedPhotos.map((pagePhotos, pageIndex) => (
                <Page key={pageIndex} size="A4" style={styles.page}>
                    <View style={styles.photoHeader}>
                        <Text style={styles.headerTitle}>ภาพประกอบรายงาน (หน้าที่ {pageIndex + 1})</Text>
                        <Text style={styles.headerSubtitle}>{reportData.projectName}</Text>
                    </View>

                    <View style={styles.photoGrid}>
                        {pagePhotos.map((photo, photoIndex) => (
                            <View key={photo.id || photoIndex} style={styles.photoContainer}>
                                <Image src={photo.file_url} style={styles.photo} />
                                <View style={styles.photoInfo}>
                                    <Text style={styles.photoCaption}>{photo.caption || `ภาพที่ ${pageIndex * photosPerPage + photoIndex + 1}`}</Text>
                                    <Text style={styles.photoMeta}>📅 {formatDateTime(photo.taken_at)}</Text>
                                    {formatGPS(photo.latitude, photo.longitude) && (
                                        <Text style={styles.photoMeta}>📍 GPS: {formatGPS(photo.latitude, photo.longitude)}</Text>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                    <Text style={styles.footer}>หน้าที่ {pageIndex + 2} จากทั้งหมด {chunkedPhotos.length + 1}</Text>
                </Page>
            ))}
        </Document>
    );
}
