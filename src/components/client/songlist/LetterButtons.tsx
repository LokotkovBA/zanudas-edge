import clsx from "clsx";

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
                        <button
                            className="flex w-6 justify-center border border-sky-800 bg-sky-800 px-1 hover:border-slate-50"
                            onClick={() => scrollToLetter(firstLetter)}
                        >
                            {firstLetter}
                        </button>
                    </li>
                );
            })}
        </menu>
    );
}

function scrollToLetter(letter: string) {
    document.getElementById(letter)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
    });
}
