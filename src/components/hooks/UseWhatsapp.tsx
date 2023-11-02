import { IClient } from "../../model/interfaces/ClientModel";
import React from "react";
import QRCode from 'qrcode';
import {
    startWhatsappServices,
    sendWhatsappMessage,
    getWhatsappSeedData,
    restartWhatsappServices, closeWhatsappServices, cancelWhatsappMessaging
} from "../../services/promotions";
import { toast } from "react-toastify";
import { CONNECTED_EVENT, DEV_SOCKET_URL, onSocketOnce, PROD_SOCKET_URL } from "../../utils/socket.io";
import styled from "styled-components";
import * as io from "socket.io-client";
import {
    ISeed,
    IWhatsappMessage,
    IWsUser,
    WhatsappSeedTypes,
    WhatsappSessionTypes
} from "../../model/interfaces/WhatsappModels";
import { WhatsappEvents } from "../../model/socket-events";
import {localStorageImpl} from "../../utils/localStorage.utils";

export const QrCanvas = styled.canvas`
  width: 100% !important;
  height: 100% !important;
`

export const whatsappSeedStorePrefix = 'whatsappSeedData::';

const useWhatsapp = (whatsappSessionId: WhatsappSessionTypes) => {
    const [logged, setLogged] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const [stopMessagingId, setStopMessagingId] = React.useState('');
    const [socket, setSocket] = React.useState<io.Socket>();
    const [seedData, setSeedData] = React.useState<ISeed>({ groups: [], users: [], labels: [] });

    React.useEffect(() => {
        const localData = localStorageImpl.getItem(`${whatsappSeedStorePrefix}${whatsappSessionId}`)
        const storedSeedData = localData && JSON.parse(localData);
        storedSeedData && setSeedData(storedSeedData);
    }, []);


    React.useEffect(() => {
        if(!socket) {
            setSocket(io.connect(PROD_SOCKET_URL));
        }
    }, [])

    const startWhatsapp = async (start: boolean, sessionId:WhatsappSessionTypes, removeSession?: boolean) => {
        const response: any = await (await startWhatsappServices(start, sessionId, removeSession)).json();
        return response;
    }

    const restartWhatsapp = async (sessionId:WhatsappSessionTypes) => {
        const response: any = await (await restartWhatsappServices(sessionId)).json();
        return response;
    }

    const closeWhatsapp = async (sessionId:WhatsappSessionTypes) => {
        const response: any = await (await closeWhatsappServices(sessionId)).json();
        return response;
    }

    const updateSeedDataWithLocalStorage = (sessionKey: WhatsappSessionTypes) => {
        const localData = localStorageImpl.getItem(`${whatsappSeedStorePrefix}${sessionKey}`)
        const storedSeedData = localData && JSON.parse(localData);
        // const newSeed = JSON.parse(localStorageImpl.getItem(`${whatsappSeedStorePrefix}${sessionKey}`) || '[]');
        storedSeedData && setSeedData(storedSeedData);
    }

    const login = async (sessionId: WhatsappSessionTypes) => {
        updateSeedDataWithLocalStorage(sessionId);
        return startWhatsapp(true, sessionId).then(res => {
            const { status } = res;
            toast(`Whatsapp is ${status}`);
            setLogged(status === 'logged')
            setLoading(status !== 'logged')
        });
    }

    const logOut = async (sessionId: WhatsappSessionTypes) => {
        return closeWhatsapp(sessionId);
    };

    const destroyWsClient = async (sessionId: WhatsappSessionTypes) => {
        setLoading(true);
        await startWhatsapp(false, sessionId);
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

    const fetchWsSeedData = async (sessionId = whatsappSessionId, seedType: WhatsappSeedTypes ) => {
        const emptySeed = seedData.groups?.length === 0 && seedData.users?.length === 0 && seedData.labels?.length === 0;
        setLoading(emptySeed)
        const data = await (await getWhatsappSeedData(sessionId, seedType)).json()
        if(!data.error) {
            const localData = JSON.parse(localStorageImpl.getItem(`${whatsappSeedStorePrefix}${sessionId}`) || '{}');
            localStorageImpl.setItem(`${whatsappSeedStorePrefix}${sessionId}`, JSON.stringify({...localData,...data}));
            setSeedData({...seedData,...data});
        }
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

                onSocketOnce(socket,WhatsappEvents.ON_AUTH_SUCCESS, ({ sessionId }) => {
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
            onSocketOnce(socket, WhatsappEvents.ON_SENT_MESSAGE, sent);
            onSocketOnce(socket, WhatsappEvents.ON_END_MESSAGE, end);
        }
    }

    const sendMessage = async (sessionId: WhatsappSessionTypes, contacts: (IClient | IWsUser)[], message: IWhatsappMessage) => {
        const {stopMessagesId} = await sendWhatsappMessage(sessionId, contacts, message);
        setStopMessagingId(stopMessagesId);
    }

    const stopMessaging = async () => {
        await cancelWhatsappMessaging(stopMessagingId);
        setStopMessagingId('');
    }


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
        fetchWsSeedData,
        updateSeedDataWithLocalStorage,
        restartWhatsapp,
        stopMessaging,
        stopMessagingId
    };

}

export default  useWhatsapp
