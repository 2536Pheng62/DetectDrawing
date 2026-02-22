import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Image,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 10,
        fontFamily: 'Helvetica',
    },
    header: {
        textAlign: 'center',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        paddingBottom: 10,
    },
    headerTitle: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        fontSize: 11,
        marginTop: 3,
        color: '#555',
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
    gpsIcon: {
        marginRight: 2,
    },
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 30,
        right: 30,
        textAlign: 'center',
        fontSize: 9,
        color: '#666',
    },
    pageNumber: {
        position: 'absolute',
        bottom: 20,
        right: 30,
        fontSize: 10,
        color: '#333',
    },
    noPhotos: {
        textAlign: 'center',
        marginTop: 100,
        fontSize: 14,
        color: '#999',
    },
});

// Interfaces
interface Photo {
    id: string;
    file_url: string;
    caption?: string;
    latitude?: number;
    longitude?: number;
    taken_at?: string;
}

interface PhotoPagePDFProps {
    photos: Photo[];
    projectName: string;
    reportDate: string;
    photosPerPage?: number; // 4 หรือ 6 รูปต่อหน้า
}

/**
 * PDF Template หน้ารูปถ่ายหน้างาน
 * - 4-6 รูปต่อหน้า (Grid Layout)
 * - Caption + พิกัด GPS ใต้ภาพ
 * - วันที่-เวลาถ่าย
 */
export function PhotoPagePDF({
    photos,
    projectName,
    reportDate,
    photosPerPage = 4,
}: PhotoPagePDFProps) {
    // แบ่งรูปเป็นหน้าๆ
    const chunkedPhotos: Photo[][] = [];
    for (let i = 0; i < photos.length; i += photosPerPage) {
        chunkedPhotos.push(photos.slice(i, i + photosPerPage));
    }

    const formatDateTime = (dateString?: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatGPS = (lat?: number, lon?: number) => {
        if (!lat || !lon) return null;
        return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (photos.length === 0) {
        return (
            <Document>
                <Page size="A4" style={styles.page}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>ภาพประกอบรายงาน</Text>
                        <Text style={styles.headerSubtitle}>{projectName}</Text>
                    </View>
                    <Text style={styles.noPhotos}>ไม่มีรูปถ่ายในรายงานนี้</Text>
                </Page>
            </Document>
        );
    }

    return (
        <Document>
            {chunkedPhotos.map((pagePhotos, pageIndex) => (
                <Page key={pageIndex} size="A4" style={styles.page}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>ภาพประกอบรายงานการควบคุมงาน</Text>
                        <Text style={styles.headerSubtitle}>
                            {projectName} | วันที่ {formatDate(reportDate)}
                        </Text>
                    </View>

                    {/* Photo Grid */}
                    <View style={styles.photoGrid}>
                        {pagePhotos.map((photo, photoIndex) => (
                            <View key={photo.id || photoIndex} style={styles.photoContainer}>
                                <Image src={photo.file_url} style={styles.photo} />
                                <View style={styles.photoInfo}>
                                    <Text style={styles.photoCaption}>
                                        {photo.caption || `ภาพที่ ${pageIndex * photosPerPage + photoIndex + 1}`}
                                    </Text>
                                    <Text style={styles.photoMeta}>
                                        📅 {formatDateTime(photo.taken_at)}
                                    </Text>
                                    {formatGPS(photo.latitude, photo.longitude) && (
                                        <Text style={styles.photoMeta}>
                                            📍 GPS: {formatGPS(photo.latitude, photo.longitude)}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Page Number */}
                    <Text style={styles.pageNumber}>
                        หน้าที่ {pageIndex + 1} / {chunkedPhotos.length}
                    </Text>

                    {/* Footer */}
                    <Text style={styles.footer}>
                        เอกสารแนบประกอบรายงานการควบคุมงานก่อสร้าง
                    </Text>
                </Page>
            ))}
        </Document>
    );
}

export default PhotoPagePDF;
