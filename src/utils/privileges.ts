export function isAdmin(privileges?: number): boolean {
    return privileges ? (privileges & 512) !== 0 : false;
}

export function isMod(privileges?: number): boolean {
    return privileges ? (privileges & 256) !== 0 : false;
}

export function excludeStuff(privileges?: number): number {
    return privileges ? privileges & 1279 : 0;
}
