import clsx from "clsx";

type EntryNumberProps = {
    number: number;
    current: boolean;
    played: boolean;
    visible: boolean;
    className?: string;
};

export function EntryNumber({
    number,
    visible,
    played,
    current,
    className,
}: EntryNumberProps) {
    return (
        <span
            className={clsx("rounded p-1 text-center leading-none", className, {
                "self-start": !className,
                "bg-sky-800": !current && !played && visible,
                "bg-amber-400 text-black": current && visible,
                "bg-slate-700": played && !current && visible,
                "bg-red-800": !visible,
            })}
        >
            {number}
        </span>
    );
}
