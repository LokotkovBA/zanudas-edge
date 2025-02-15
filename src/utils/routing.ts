import { type ReadonlyURLSearchParams } from "next/navigation";

export function createQueryString(
    name: string,
    searchParams: ReadonlyURLSearchParams,
    value?: string,
) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
        params.set(name, value);
    } else {
        params.delete(name);
    }

    return params.toString();
}

export function createMultipleQueryString(searchParams: {
    [key: string]: string;
}) {
    const params = new URLSearchParams();

    for (const [param, value] of Object.entries(searchParams)) {
        params.set(param, value);
    }

    return params.toString();
}
