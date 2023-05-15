/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        appDir: true,
        serverComponentsExternalPackages: ["better-sqlite3"],
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
