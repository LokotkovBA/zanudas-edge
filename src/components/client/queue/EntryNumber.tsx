import clsx from "clsx";

type EntryNumberProps = {
    number: number;
    current: boolean;
    played: boolean;
    visible: boolean;
};

export function EntryNumber({
    number,
    visible,
    played,
    current,
}: EntryNumberProps) {
    return (
        <span
            className={clsx("self-start rounded p-1 text-center leading-none", {
                "bg-sky-800": !current && !played && visible,
                "bg-amber-400 text-black": current && visible,
                "bg-slate-700": played && !current,
                "bg-red-800": !visible,
            })}
        >
            {number}
        </span>
    );
}
