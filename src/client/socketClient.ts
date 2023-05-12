import { io } from "socket.io-client";
import { env } from "~/env.mjs";

export const socketClient = io(env.NEXT_PUBLIC_SOCKET_ADDRESS);
