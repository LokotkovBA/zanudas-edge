/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
        appDir: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.jtvnw.net',
                port: '',
                pathname: '/**',
            },
        ],
    },
}

module.exports = nextConfig
