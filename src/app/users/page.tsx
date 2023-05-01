import Image from "next/image";
import { redirect } from "next/navigation";
import PrivilegeSetter from "~/components/client/PrivilegeSetter";
import { drizzleClient } from "~/drizzle/db";
import { users } from "~/drizzle/schemas/auth";
import { serverAPI } from "~/server/api";
import { isAdmin } from "~/utils/privileges";

export const runtime = "edge";

export default async function Users() {
    const user = await serverAPI.getAuth.fetch();
    if (!isAdmin(user?.privileges)) {
        redirect("/");
    }

    const usersData = await drizzleClient
        .select({
            id: users.id,
            image: users.image,
            name: users.name,
            privileges: users.privileges,
        })
        .from(users)
        .all();

    return (
        <main>
            {usersData.map(({ id, name, image, privileges }) => (
                <section key={id}>
                    <h2>{name}</h2>
                    {image && (
                        <Image
                            width={45}
                            height={45}
                            alt={`${name}'s profile picture`}
                            src={image}
                        />
                    )}
                    <PrivilegeSetter user_id={id} privileges={privileges} />
                </section>
            ))}
        </main>
    );
}
