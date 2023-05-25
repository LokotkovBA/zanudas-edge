import clsx from "clsx";
import Link from "next/link";

type LetterButtonsProps = {
    letters: string[];
    className: string;
};

export function LetterButtons({ letters, className }: LetterButtonsProps) {
    return (
        <menu className={clsx("flex-wrap", className)}>
            {letters.map((firstLetter) => {
                return (
                    <li key={firstLetter}>
                        <Link
                            className="flex w-6 justify-center border border-sky-800 bg-sky-800 px-1 hover:border-slate-50"
                            scroll={false}
                            href={`/songlist#${firstLetter}`}
                        >
                            {firstLetter}
                        </Link>
                    </li>
                );
            })}
        </menu>
    );
}
