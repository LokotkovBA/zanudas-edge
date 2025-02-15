/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        appDir: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**.jtvnw.net",
                port: "",
                pathname: "/**",
            },
        ],
    },
};

module.exports = nextConfig;
