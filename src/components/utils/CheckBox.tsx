import clsx from "clsx";
import { CheckMark } from "~/svg/CheckMark";
import { Cross } from "~/svg/Cross";

type CheckBoxProps = {
    checked: boolean;
    className?: string;
    onClick: (oldChecked: boolean) => void;
    id: string;
};

export function CheckBox({ checked, onClick, className, id }: CheckBoxProps) {
    return (
        <div
            onClick={() => onClick(checked)}
            className={clsx("cursor-pointer rounded-xl px-4 py-1", className, {
                "bg-sky-600 dark:bg-sky-900": checked,
                "bg-neutral-300 dark:bg-neutral-800": !checked,
            })}
        >
            <div
                className={clsx("transition-all ease-in-out", {
                    "translate-x-2": checked,
                    "-translate-x-2": !checked,
                })}
            >
                {checked ? (
                    <CheckMark
                        id={id}
                        size="1rem"
                        className="fill-sky-200 dark:fill-sky-500"
                    />
                ) : (
                    <Cross
                        id={id}
                        className="fill-neutral-500 dark:fill-neutral-400"
                        size="1rem"
                    />
                )}
            </div>
        </div>
    );
}
