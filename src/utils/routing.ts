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
