import { Socket } from "socket.io-client";

export const DEV_SOCKET_URL = 'http://localhost:3000'
// export const PROD_SOCKET_URL = 'http://165.232.158.16'
export const PROD_SOCKET_URL = 'https://www.betuel-promotions.xyz'
export const CONNECTED_EVENT = 'connect'
export const onSocketOnce = (socket: Socket, eventName: string, callback: (data: any) => any) => {
    socket.removeListener(eventName)
    if (socket) {
        console.log('event:', eventName);
        socket.on(eventName, callback);
    }
};
