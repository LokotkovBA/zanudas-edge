/** @type {import('tailwindcss').Config} */
module.exports = {
    important: true, //for react-hot-toast
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["var(--font-inter)"],
                comic: ["var(--font-comic)"],
            },
            gridTemplateColumns: {
                desktopEdit: ".5fr 1fr",
                mobileEdit: ".2fr 1fr",
                queue: "3fr 1fr",
                mobileQueue: "1.5fr 1.5fr 1fr",
            },
            animation: {
                af: "af infinite 4s linear",
            },
            keyframes: {
                af: {
                    "0%, 100%": {
                        "text-shadow": "0 0 12px white",
                    },
                    "25%": {
                        "text-shadow": "0 0 6px white",
                    },
                    "50%": {
                        "text-shadow": "0 0 9px white",
                    },
                    "75%": {
                        "text-shadow": "0 0 0px white",
                    },
                },
            },
        },
    },
    plugins: [],
};
