import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Daily Field Report | รายงานควบคุมงานก่อสร้าง",
    description: "ระบบบันทึกรายงานประจำวันสำหรับงานวิศวกรรมโยธา พร้อม Smart Carry-Forward",
    manifest: "/manifest.json",
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: "#2563eb",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="th" suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600;700&display=swap"
                    rel="stylesheet"
                />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="apple-mobile-web-app-title" content="DailyReport" />
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                        if ('serviceWorker' in navigator) {
                            window.addEventListener('load', function() {
                                navigator.serviceWorker.register('/sw.js').then(function(reg) {
                                    console.log('ServiceWorker registration successful');
                                }, function(err) {
                                    console.log('ServiceWorker registration failed: ', err);
                                });
                            });
                        }
                        `,
                    }}
                />
            </head>
            <body className="min-h-screen bg-gray-50" suppressHydrationWarning>
                <main className="max-w-md mx-auto pb-20">
                    {children}
                </main>
            </body>
        </html>
    );
}
