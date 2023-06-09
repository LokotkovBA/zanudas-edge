import { IntroOverlay } from "~/components/client/intro/IntroOverlay";
import { type IntroEntry } from "~/utils/types/intro";

export const runtime = "edge";

export const metadata = {
    title: "Intro preview",
};

export default async function IntroPreview({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const previewData = parseIntroParams(searchParams);

    return <IntroOverlay introData={[previewData]} />;
}

function parseIntroParams(searchParams: {
    [key: string]: string | string[] | undefined;
}) {
    const out: IntroEntry = {
        id: -1,
        mainMessage: "",
        preMessage: "",
        symbol: "",
        progress: null,
    };

    if (
        !searchParams.mainMessage ||
        typeof searchParams.mainMessage !== "string"
    ) {
        return out;
    }

    out.mainMessage = searchParams.mainMessage;

    if (typeof searchParams.preMessage === "string") {
        out.preMessage = searchParams.preMessage;
    }

    if (typeof searchParams.symbol === "string") {
        out.symbol = searchParams.symbol;
    }

    if (
        typeof searchParams.progress === "string" &&
        searchParams.progress !== ""
    ) {
        out.progress = parseInt(searchParams.progress);
    }

    return out;
}
