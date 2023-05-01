import Image from "next/image";
import { notFound } from "next/navigation";
// import { redirect } from "next/navigation";
import PrivilegeSetter from "~/components/client/PrivilegeSetter";
import { drizzleClient } from "~/drizzle/db";
import { users } from "~/drizzle/schemas/auth";
import { serverAPI } from "~/server/api";
import { isAdmin } from "~/utils/privileges";

export const runtime = "edge";

export default async function Users() {
    const user = await serverAPI.getAuth.fetch();
    if (!isAdmin(user?.privileges)) {
        notFound();
        // redirect("/"); internal server error on edge
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
        <main className="flex items-center gap-2 px-20 py-2">
            {usersData.map(({ id, name, image, privileges }) => (
                <section className="flex flex-col items-center gap-2" key={id}>
                    <h2 className="text-amber-400">{name}</h2>
                    {image && (
                        <Image
                            className="rounded-full"
                            width={45}
                            height={45}
                            alt={`${name}'s profile picture`}
                            src={image}
                        />
                    )}
                    <PrivilegeSetter
                        user_id={id}
                        privileges={privileges}
                        roles={roles}
                    />
                </section>
            ))}
        </main>
    );
}

const roles = [
    "Master",
    "Admin",
    "Mod",
    "Reserved",
    "Reserved",
    "Reserved",
    "Reserved",
    "Reserved",
    "Reserved",
    "Reserved",
    "Reserved",
];
