import { env } from "~/env.mjs";
import CryptoJS from "crypto-js";

const iv = CryptoJS.SHA256(env.SOCKET_SECRET);
const key = CryptoJS.SHA256(env.SOCKET_KEY);

export function encrypt(msg: string) {
    return CryptoJS.AES.encrypt(msg, key, { iv }).toString();
}
