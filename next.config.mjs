/** @type {import('next').NextConfig} */
const nextConfig = {
    // PWA configuration will be added later
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*.supabase.co',
            },
        ],
    },
};

export default nextConfig;
