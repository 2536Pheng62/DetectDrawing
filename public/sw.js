const CACHE_NAME = 'daily-field-report-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/dashboard',
    '/manifest.json',
    '/pwa_icon_512.png',
    // สามารถเพิ่ม assets อื่นๆ ที่จำเป็นต้องใช้แม้ออฟไลน์ได้ที่นี่
];

// ติดตั้ง Service Worker และ Cache assets พื้นฐาน
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// จัดการ Fetch Request (เน้น Cache-First สำหรับ Static Assets)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).catch(() => {
                // กรณีออฟไลน์และไม่มีใน Cache ให้ส่งหน้าว่างหรือหน้าแจ้งเตือน
                if (event.request.mode === 'navigate') {
                    return caches.match('/');
                }
            });
        })
    );
});

// ล้าง Cache เก่าเมื่อมีการอัปเดตเวอร์ชัน
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
});
