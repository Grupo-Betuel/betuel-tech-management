import { IClient } from "../../model/interfaces/ClientModel";
import React from "react";
import QRCode from 'qrcode';
import { startWhatsappServices, sendWhatsappMessage } from "../../services/promotions";
import { toast } from "react-toastify";
import { CONNECTED_EVENT, DEV_SOCKET_URL, onSocketOnce, PROD_SOCKET_URL } from "../../utils/socket.io";
import styled from "styled-components";
import * as io from "socket.io-client";
import { IWhatsappMessage, WhatsappSessionTypes } from "../../model/interfaces/WhatsappModels";
import { WhatsappEvents } from "../../model/socket-events";

export const QrCanvas = styled.canvas`
  width: 100% !important;
  height: 100% !important;
`

const useWhatsapp = (whatsappSessionId: WhatsappSessionTypes) => {
    const [logged, setLogged] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const [socket, setSocket] = React.useState<io.Socket>()

    React.useEffect(() => {
        if(!socket) {
            setSocket(io.connect(PROD_SOCKET_URL));
        }
    }, [])

    const handleWhatsapp = async (start: boolean, sessionId:WhatsappSessionTypes) => {
        const response: any = await (await startWhatsappServices(start, sessionId)).json();
        return response;
    }


    const login = async (sessionId: WhatsappSessionTypes) => {
        return handleWhatsapp(true, sessionId).then(res => {
            const { status } = res;
            toast(`Whatsapp is ${status}`);
            setLogged(status === 'logged')
            setLoading(status !== 'logged')
        });
    }

    const logOut = async (sessionId: WhatsappSessionTypes) => {
        return handleWhatsapp(false, sessionId);
    };

    const generateQr = (data: any) => {
        const canvas = document.getElementById('canvas-qr');
        if(canvas) {
            QRCode.toCanvas(canvas, data, function (error) {
                if (error) console.error('qr error:', error);
            })
        }
    }

    // handling whatsapp service
    React.useEffect(() => {
        if(socket) {
            generateQr('init');
            socket.on(CONNECTED_EVENT, () => {
                onSocketOnce(socket,WhatsappEvents.ON_LOADING, ({loading}) => {
                    setLoading(loading)
                })
                // generating qr code
                onSocketOnce(socket,WhatsappEvents.ON_QR, ({qrCode}) => {
                    generateQr(qrCode);
                    setLoading(false);
                });

                onSocketOnce(socket,WhatsappEvents.ON_AUTH_SUCCESS, () => {
                    setLogged(true)
                    setLoading(false)
                });

                onSocketOnce(socket,WhatsappEvents.ON_AUTH_FAILED, async () => {
                    setLogged(false)
                    setLoading(false);
                });

                onSocketOnce(socket,WhatsappEvents.ON_READY, () => {
                    toast('¡Whatsapp listo para usar!');
                    setLoading(false);
                });

                onSocketOnce(socket,WhatsappEvents.ON_LOGOUT, () => {
                    toast('Sesión de Whatsapp Cerrada');
                    setLogged(false);
                });
                login(whatsappSessionId)
            })
        }

        return () => socket ? socket.disconnect() : {} as any;
    }, [socket]);

    const handleWhatsappMessaging = (sent: (contact: IClient) => any, end: (contacts: IClient[]) => any) => {
        if(socket) {
            onSocketOnce(socket, 'whatsapp-message-sent', sent);
            onSocketOnce(socket, 'whatsapp-messages-end', end);
        }
    }

    const sendMessage = async (sessionId: WhatsappSessionTypes, contacts: IClient[], message: IWhatsappMessage) =>
        await sendWhatsappMessage(sessionId, contacts, message)

    return {
        logged,
        loading,
        login,
        logOut,
        handleWhatsappMessaging,
        sendMessage,
        setLogged,
        setLoading,
        qrElement: <QrCanvas id="canvas-qr" />
    };

}

export default  useWhatsapp
