/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
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
