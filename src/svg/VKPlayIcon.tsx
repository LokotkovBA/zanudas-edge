type VKPlayIconProps = {
    size: string;
};

export function VKPlayIcon({ size }: VKPlayIconProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            height={size}
            width={size}
            viewBox="0 0 39 39"
        >
            <clipPath id="a">
                <path d="m0 0h150.93v39h-150.93z" />
            </clipPath>
            <g clipPath="url(#a)">
                <path
                    d="m20.319 0c8.814 0 13.221 0 15.951 2.73s2.73 7.137 2.73 15.951v1.638c0 8.814 0 13.221-2.73 15.951s-7.137 2.73-15.951 2.73h-1.638c-8.814 0-13.221 0-15.951-2.73s-2.73-7.137-2.73-15.95v-1.64c0-8.814 0-13.22 2.73-15.95s7.137-2.73 15.951-2.73z"
                    fill="#07f"
                />
                <path
                    d="m.117 10.96c-.117 2.104-.117 4.64-.117 7.72v1.638c0 2.34 0 4.33.039 6.084 5.109 2.498 11.973 4.018 19.461 4.018s14.352-1.52 19.461-4.017c.039-1.755.039-3.783.039-6.083v-1.638c0-3.08 0-5.616-.117-7.76h-38.766z"
                    fill="#0009b4"
                />
                <circle
                    cx="27.11"
                    cy="19.7"
                    r="3.71"
                    stroke="#fff"
                    strokeWidth="3.897"
                />
                <path
                    d="m16.38 24.18-8.58-8.58m8.58 0-8.58 8.58"
                    stroke="#fff"
                    strokeWidth="3.897"
                />
            </g>
        </svg>
    );
}
