type PlayIconProps = {
    size: string;
    className?: string;
};

export function PlayIcon({ size, className }: PlayIconProps) {
    return (
        <svg
            className={className}
            width={size}
            height={size}
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M15 24V11.8756L25.5 17.9378L36 24L25.5 30.0622L15 36.1244V24Z"
                strokeWidth="4"
                strokeLinejoin="round"
            />
        </svg>
    );
}
