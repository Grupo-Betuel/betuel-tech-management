import React from "react";
import * as io from "socket.io-client";
import {CONNECTED_EVENT, DEV_SOCKET_URL, PROD_SOCKET_URL} from "../../utils/socket.io";

export interface ISocketHookProps {
    socket: io.Socket | undefined;
    connected: boolean;
}
export const useSocket = () => {
    const [socket, setSocket] = React.useState<io.Socket>();
    const [connected, setConnected] = React.useState<boolean>(false);

    React.useEffect(() => {
        if(!socket) {
            setSocket(io.connect(PROD_SOCKET_URL));
        }
        return () => {
            socket?.disconnect()
            socket?.removeAllListeners();
        };
    }, []);

    React.useEffect(() => {
        socket && socket.on(CONNECTED_EVENT, () => {
            setConnected(true);
        });
    }, [socket])

    return {
        socket,
        connected,
    }
}