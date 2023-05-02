import { FileUploader } from "~/components/client/FileUploader";
import { serverAPI } from "~/server/api";
import { isAdmin } from "~/utils/privileges";

export const runtime = "edge";

export default async function SongList() {
    const userData = await serverAPI.getAuth.fetch();
    return (
        <main className="flex flex-col items-center gap-2 pt-2">
            {isAdmin(userData?.privileges) && <FileUploader />}
        </main>
    );
}
