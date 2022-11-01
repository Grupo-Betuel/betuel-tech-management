import { IClient } from "../../model/interfaces/ClientModel";
import React from "react";
import QRCode from 'qrcode';
import { startWhatsappServices, sendWhatsappMessage, getWhatsappSeedData } from "../../services/promotions";
import { toast } from "react-toastify";
import { CONNECTED_EVENT, DEV_SOCKET_URL, onSocketOnce, PROD_SOCKET_URL } from "../../utils/socket.io";
import styled from "styled-components";
import * as io from "socket.io-client";
import { ISeed, IWhatsappMessage, IWsUser, WhatsappSessionTypes } from "../../model/interfaces/WhatsappModels";
import { WhatsappEvents } from "../../model/socket-events";

export const QrCanvas = styled.canvas`
  width: 100% !important;
  height: 100% !important;
`

const useWhatsapp = (whatsappSessionId: WhatsappSessionTypes) => {
    const [logged, setLogged] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const [socket, setSocket] = React.useState<io.Socket>();
    const [seedData, setSeedData] = React.useState<ISeed>({ groups: [], users: [], labels: [] });

    React.useEffect(() => {
        if(!socket) {
            setSocket(io.connect(PROD_SOCKET_URL));
        }
    }, [])

    const handleWhatsapp = async (start: boolean, sessionId:WhatsappSessionTypes, removeSession?: boolean) => {
        const response: any = await (await startWhatsappServices(start, sessionId, removeSession)).json();
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
        return handleWhatsapp(false, sessionId, true);
    };

    const destroyWsClient = async (sessionId: WhatsappSessionTypes) => {
        setLoading(true);
        await handleWhatsapp(false, sessionId);
        setLoading(false);
    };

    const generateQr = (data: any) => {
        const canvas = document.getElementById('canvas-qr');
        if(canvas) {
            QRCode.toCanvas(canvas, data, function (error) {
                if (error) console.error('qr error:', error);
            })
        }
    }

    const fetchWsSeedData = async (sessionId = whatsappSessionId) => {
        setLoading(true);
        const data = await (await getWhatsappSeedData(sessionId)).json()
        setSeedData(data);
        setLoading(false);
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
                    fetchWsSeedData();
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
            onSocketOnce(socket, WhatsappEvents.ON_SENT_MESSAGE, sent);
            onSocketOnce(socket, WhatsappEvents.ON_END_MESSAGE, end);
        }
    }

    const sendMessage = async (sessionId: WhatsappSessionTypes, contacts: (IClient | IWsUser)[], message: IWhatsappMessage) =>
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
        seedData,
        qrElement: <QrCanvas id="canvas-qr" />,
        destroyWsClient,
        fetchWsSeedData
    };

}

export default  useWhatsapp
