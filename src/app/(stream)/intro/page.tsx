import { IntroOverlay } from "~/components/client/intro/IntroOverlay";
import { serverAPI } from "~/server/api";

export const runtime = "edge";

export default async function Intro() {
    const introData = await serverAPI.intro.getAll.fetch();
    return <IntroOverlay introData={introData} />;
}
