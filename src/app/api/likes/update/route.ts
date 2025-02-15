import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { drizzleClient } from "~/drizzle/db";
import { likes, queue } from "~/drizzle/schemas/queue";

const updateLikesSchema = z.array(z.number());

export const runtime = "edge";

export async function PUT(request: Request) {
    const toUpdate = updateLikesSchema.safeParse(await request.json());
    if (!toUpdate.success) {
        return new NextResponse(null, {
            status: 400,
            statusText: "Bad request",
        });
    }

    const dbPromises: Promise<void>[] = new Array(toUpdate.data.length);
    for (const entryId of toUpdate.data) {
        dbPromises.push(updateLikes(entryId));
    }
    await Promise.all(dbPromises);
    return new NextResponse(null, { status: 200, statusText: "Success" });
}

async function updateLikes(songId: number) {
    const likesData = await drizzleClient
        .select({ value: likes.value })
        .from(likes)
        .where(eq(likes.songId, songId))
        .all();

    let likeCount = 0;
    for (const { value } of likesData) {
        likeCount += value;
    }

    await drizzleClient
        .update(queue)
        .set({ likeCount })
        .where(eq(queue.id, songId))
        .run();
}
