"use client";

import superjson from "superjson";
import { Hydrate, type DehydratedState } from "@tanstack/react-query";
import { useMemo } from "react";

export function HydrateClient({
    children,
    state,
}: {
    children: React.ReactNode;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    state: any;
}) {
    const transformedState: DehydratedState = useMemo(() => {
        return superjson.deserialize(state);
    }, [state]);

    return <Hydrate state={transformedState}>{children}</Hydrate>;
}
