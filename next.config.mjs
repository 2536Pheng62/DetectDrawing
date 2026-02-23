import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Fix "workspace root inferred incorrectly" — OneDrive has its own
    // package-lock.json above this project, confusing Turbopack.
    // NOTE: .next build cache is redirected via a directory junction:
    //   C:\Users\pang_\OneDrive\Apps\detctDrawing\.next  →  C:\Users\pang_\.next\detctDrawing
    // OneDrive skips junction points, so Turbopack can write freely.
    turbopack: {
        root: __dirname,
    },

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
