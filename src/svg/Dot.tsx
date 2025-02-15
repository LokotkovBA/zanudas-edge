type DotProps = {
    size: string;
    className: string;
};

export function Dot({ size, className }: DotProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 48 48"
            className={className}
        >
            <path
                d="M24 33C28.9706 33 33 28.9706 33 24C33 19.0294 28.9706 15 24 15C19.0294 15 15 19.0294 15 24C15 28.9706 19.0294 33 24 33Z"
                strokeWidth="4"
            />
        </svg>
    );
}
