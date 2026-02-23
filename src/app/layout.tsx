import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
    title: "ระบบควบคุมงานก่อสร้าง | DailyReport",
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
                <meta name="apple-mobile-web-app-title" content="SiteControl" />
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                        if ('serviceWorker' in navigator) {
                            window.addEventListener('load', function() {
                                navigator.serviceWorker.register('/sw.js');
                            });
                        }
                        `,
                    }}
                />
            </head>
            <body className="min-h-screen bg-gray-50" suppressHydrationWarning>
                <Navbar />
                <main className="min-h-[calc(100vh-3.5rem)]">
                    {children}
                </main>
            </body>
        </html>
    );
}
