import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Font,
    Image,
} from '@react-pdf/renderer';

// Register Thai Font (TH Sarabun New) - ต้องมีไฟล์ฟอนต์
// Font.register({
//     family: 'THSarabunNew',
//     fonts: [
//         { src: '/fonts/THSarabunNew.ttf', fontWeight: 'normal' },
//         { src: '/fonts/THSarabunNew-Bold.ttf', fontWeight: 'bold' },
//     ]
// });

// Styles สำหรับ PDF รายงานทางการ
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
        justifyContent: 'space-between',
    },
    signatureBox: {
        width: '30%',
        textAlign: 'center',
    },
    signatureLine: {
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        marginTop: 40,
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
});

// Weather Label Mapping
const WEATHER_LABELS: Record<string, string> = {
    sunny: 'แดดจ้า ☀️',
    cloudy: 'มีเมฆ ☁️',
    rainy: 'ฝนตก 🌧️',
    stormy: 'พายุฝน ⛈️',
};

// Interfaces
interface WorkItem {
    task_name: string;
    unit: string;
    planned_quantity: number;
    actual_quantity: number;
    progress_percent: number;
    weight?: number;
}

interface ReportData {
    // Project Info
    projectName: string;
    contractNumber?: string;
    contractorName?: string;
    provinceName?: string;
    // Report Info
    reportDate: string;
    reportNumber?: number;
    weather: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
    temperature?: number;
    humidity?: number;
    // Content
    workSummary: string;
    issues?: string;
    laborCount: number;
    equipmentNotes?: string;
    // Work Items
    workItems: WorkItem[];
    // Progress
    totalProgress: number;
    plannedProgress?: number;
    // Signatures
    inspectorName?: string;
    contractorSigneeName?: string;
    approverName?: string;
}

interface ReportPDFProps {
    data: ReportData;
    logoUrl?: string;
}

/**
 * PDF Template รายงานควบคุมงานก่อสร้าง
 * ตามมาตรฐานกองพัฒนาและบำรุงรักษาอาคารราชพัสดุ
 */
export function ReportPDF({ data, logoUrl }: ReportPDFProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        };
        // แปลงเป็นวันที่ไทย (พ.ศ.)
        const thaiDate = date.toLocaleDateString('th-TH', options);
        return thaiDate;
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    {logoUrl && (
                        <Image src={logoUrl} style={{ width: 60, height: 60, marginBottom: 10 }} />
                    )}
                    <Text style={styles.headerTitle}>รายงานการควบคุมงานก่อสร้างประจำวัน</Text>
                    <Text style={styles.headerSubtitle}>กองพัฒนาและบำรุงรักษาอาคารราชพัสดุ</Text>
                    <View style={styles.headerLine} />
                </View>

                {/* Project Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ข้อมูลโครงการ</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>ชื่อโครงการ:</Text>
                        <Text style={styles.value}>{data.projectName}</Text>
                    </View>
                    {data.contractNumber && (
                        <View style={styles.row}>
                            <Text style={styles.label}>เลขที่สัญญา:</Text>
                            <Text style={styles.value}>{data.contractNumber}</Text>
                        </View>
                    )}
                    {data.contractorName && (
                        <View style={styles.row}>
                            <Text style={styles.label}>ผู้รับจ้าง:</Text>
                            <Text style={styles.value}>{data.contractorName}</Text>
                        </View>
                    )}
                    {data.provinceName && (
                        <View style={styles.row}>
                            <Text style={styles.label}>จังหวัด:</Text>
                            <Text style={styles.value}>{data.provinceName}</Text>
                        </View>
                    )}
                    <View style={styles.row}>
                        <Text style={styles.label}>วันที่รายงาน:</Text>
                        <Text style={styles.value}>{formatDate(data.reportDate)}</Text>
                    </View>
                </View>

                {/* Weather */}
                <View style={styles.weatherBox}>
                    <View style={styles.weatherItem}>
                        <Text style={{ fontWeight: 'bold' }}>สภาพอากาศ</Text>
                        <Text>{WEATHER_LABELS[data.weather] || data.weather}</Text>
                    </View>
                    {data.temperature && (
                        <View style={styles.weatherItem}>
                            <Text style={{ fontWeight: 'bold' }}>อุณหภูมิ</Text>
                            <Text>{data.temperature}°C</Text>
                        </View>
                    )}
                    {data.humidity && (
                        <View style={styles.weatherItem}>
                            <Text style={{ fontWeight: 'bold' }}>ความชื้น</Text>
                            <Text>{data.humidity}%</Text>
                        </View>
                    )}
                    <View style={styles.weatherItem}>
                        <Text style={{ fontWeight: 'bold' }}>แรงงาน</Text>
                        <Text>{data.laborCount} คน</Text>
                    </View>
                </View>

                {/* Work Items Table */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>รายการงานที่ดำเนินการ</Text>
                    <View style={styles.table}>
                        <View style={styles.tableHeader}>
                            <Text style={styles.col1}>ลำดับ</Text>
                            <Text style={styles.col2}>รายการงาน</Text>
                            <Text style={styles.col3}>หน่วย</Text>
                            <Text style={styles.col4}>ปริมาณตามแผน</Text>
                            <Text style={styles.col5}>ปริมาณจริง</Text>
                            <Text style={styles.col6}>% ความคืบหน้า</Text>
                        </View>
                        {data.workItems.map((item, index) => (
                            <View key={index} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                                <Text style={styles.col1}>{index + 1}</Text>
                                <Text style={styles.col2}>{item.task_name}</Text>
                                <Text style={styles.col3}>{item.unit}</Text>
                                <Text style={styles.col4}>{item.planned_quantity.toLocaleString()}</Text>
                                <Text style={styles.col5}>{item.actual_quantity.toLocaleString()}</Text>
                                <Text style={styles.col6}>{item.progress_percent.toFixed(2)}%</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Summary */}
                <View style={styles.summary}>
                    <Text style={styles.summaryTitle}>สรุปผลการดำเนินงาน</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>ความคืบหน้าสะสม:</Text>
                        <Text style={styles.value}>{data.totalProgress.toFixed(2)}%</Text>
                    </View>
                    {data.plannedProgress && (
                        <View style={styles.row}>
                            <Text style={styles.label}>ตามแผนงาน:</Text>
                            <Text style={styles.value}>{data.plannedProgress.toFixed(2)}%</Text>
                        </View>
                    )}
                    {/* Progress Bar */}
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${Math.min(data.totalProgress, 100)}%` }]} />
                    </View>
                </View>

                {/* Work Summary */}
                {data.workSummary && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>สรุปผลงานประจำวัน</Text>
                        <Text>{data.workSummary}</Text>
                    </View>
                )}

                {/* Issues */}
                {data.issues && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>ปัญหา/อุปสรรค</Text>
                        <Text>{data.issues}</Text>
                    </View>
                )}

                {/* Signature Section */}
                <View style={styles.signatureSection}>
                    <View style={styles.signatureBox}>
                        <View style={styles.signatureLine} />
                        <Text style={styles.signatureLabel}>ผู้ควบคุมงาน</Text>
                        {data.inspectorName && (
                            <Text style={styles.signatureLabel}>({data.inspectorName})</Text>
                        )}
                    </View>
                    <View style={styles.signatureBox}>
                        <View style={styles.signatureLine} />
                        <Text style={styles.signatureLabel}>ผู้รับจ้าง</Text>
                        {data.contractorSigneeName && (
                            <Text style={styles.signatureLabel}>({data.contractorSigneeName})</Text>
                        )}
                    </View>
                    <View style={styles.signatureBox}>
                        <View style={styles.signatureLine} />
                        <Text style={styles.signatureLabel}>ผู้อนุมัติ</Text>
                        {data.approverName && (
                            <Text style={styles.signatureLabel}>({data.approverName})</Text>
                        )}
                    </View>
                </View>

                {/* Footer */}
                <Text style={styles.footer}>
                    เอกสารนี้จัดทำโดยระบบรายงานผู้ควบคุมงานก่อสร้างอิเล็กทรอนิกส์ | พิมพ์เมื่อ {new Date().toLocaleString('th-TH')}
                </Text>
            </Page>
        </Document>
    );
}

export default ReportPDF;
