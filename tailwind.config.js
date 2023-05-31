/** @type {import('tailwindcss').Config} */
module.exports = {
    important: true, //for react-hot-toast
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    safelist: [
        "xl:col-start-[2]",
        "xl:col-start-[3]",
        "xl:col-start-[4]",
        "xl:col-start-[5]",
        "xl:col-start-[6]",
        "xl:col-start-[7]",
        "xl:col-start-[8]",
        "xl:row-start-[2]",
        "xl:row-start-[3]",
        "xl:row-start-[4]",
        "xl:row-start-[5]",
        "xl:row-start-[6]",
        "xl:row-start-[7]",
        "xl:row-start-[8]",
        "xl:row-start-[9]",
        "xl:row-start-[10]",
        "xl:row-start-[11]",
        "xl:row-start-[12]",
        "xl:row-end-[4]",
        "xl:row-end-[5]",
        "xl:row-end-[6]",
        "xl:row-end-[7]",
        "xl:row-end-[8]",
        "xl:row-end-[9]",
        "xl:row-end-[10]",
        "xl:row-end-[11]",
        "xl:row-end-[12]",
        "xl:row-end-[13]",
        "xl:row-end-[14]",
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
