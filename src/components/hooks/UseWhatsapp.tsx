import { IClient } from "../../model/interfaces/ClientModel";
import React from "react";
import QRCode from 'qrcode';
import { startWhatsappServices, sendWhatsappMessage } from "../../services/promotions";
import { toast } from "react-toastify";
import { DEV_SOCKET_URL, onSocketOnce } from "../../utils/socket.io";
import styled from "styled-components";
import * as io from "socket.io-client";
import { WhatsappClientIds } from "../../model/interfaces/WhatsappModels";

export const QrCanvas = styled.canvas`
  width: 100% !important;
  height: 100% !important;
`

const useWhatsapp = () => {
    const [logged, setLogged] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const [socket, setSocket] = React.useState<io.Socket>()

    React.useEffect(() => {
        if(!socket) {
            setSocket(io.connect(DEV_SOCKET_URL));
        }
    }, [])

    const startWhatsapp = async (start = true) => {
        const response: any = await (await startWhatsappServices(start, WhatsappClientIds.BETUEL_TECH)).json();
        return response;
    }

    const logOut = async () => {
       return await startWhatsapp(false);
        // return await startWhatsapp();
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
        console.log('initializing.......')
        if(socket) {
            generateQr('init');
            socket.on('connect', () => {
                onSocketOnce(socket,'whatsapp-loading', ({loading}) => {
                    console.log('loading', loading);
                    setLoading(loading)
                })
                // generating qr code
                onSocketOnce(socket,'whatsapp-qr-code', ({qrCode}) => {
                    generateQr(qrCode);
                    console.log('qrCode', qrCode);
                    setLoading(false);
                });

                onSocketOnce(socket,'whatsapp-auth-success', () => {
                    setLogged(true)
                    setLoading(false)
                });

                onSocketOnce(socket,'whatsapp-auth-fail', async () => {
                    await startWhatsapp();
                    setLogged(false)
                    setLoading(false);
                });

                onSocketOnce(socket,'whatsapp-ready', () => {
                    toast('¡Whatsapp listo para usar!');
                    setLoading(false);
                });

                onSocketOnce(socket,'whatsapp-logged-out', () => {
                    toast('Sesión de Whatsapp Cerrada');
                    setLogged(false);
                    startWhatsapp();
                });

                startWhatsapp().then(res => {
                    toast(`Whatsapp is ${res.status}`);
                    setLogged(!!res.logged);
                });

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

    const sendMessage = (contacts: IClient[]) => async () => await sendWhatsappMessage(contacts)

    return {
        logged,
        loading,
        startWhatsapp,
        logOut,
        handleWhatsappMessaging,
        sendMessage,
        qrElement: <QrCanvas id="canvas-qr" />
    };

}

export default  useWhatsapp
