import {IClient} from "../../models/interfaces/ClientModel";
import React from "react";
import QRCode from 'qrcode';
import {
    startWhatsappServices,
    sendWhatsappMessage,
    getWhatsappSeedData,
    restartWhatsappServices, closeWhatsappServices, cancelWhatsappMessaging, getGroupChatParticipants
} from "../../services/promotions";
import {toast} from "react-toastify";
import {CONNECTED_EVENT, DEV_SOCKET_URL, onSocketOnce, PROD_SOCKET_URL} from "../../utils/socket.io";
import styled from "styled-components";
import * as io from "socket.io-client";
import {
    ISeed,
    IWhatsappMessage,
    IWsUser,
    WhatsappSeedTypes,
    WhatsappSessionTypes
} from "../../models/interfaces/WhatsappModels";
import {WhatsappEvents} from "../../models/socket-events";
import {localStorageImpl} from "../../utils/localStorage.utils";

export const QrCanvas = styled.canvas`
  width: 100% !important;
  height: 100% !important;
`

export const whatsappSeedStorePrefix = 'whatsappSeedData::';

const useWhatsapp = (whatsappSessionId: WhatsappSessionTypes, autologin = true) => {
    const [logged, setLogged] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const [stopMessagingId, setStopMessagingId] = React.useState('');
    const [socket, setSocket] = React.useState<io.Socket>();
    const [seedData, setSeedData] = React.useState<ISeed>({groups: [], users: [], labels: []});

    React.useEffect(() => {
        const localData = localStorageImpl.getItem(`${whatsappSeedStorePrefix}${whatsappSessionId}`)
        const storedSeedData = localData && JSON.parse(localData);
        storedSeedData && setSeedData(storedSeedData);
    }, []);


    React.useEffect(() => {
        if (!socket) {
            setSocket(io.connect(PROD_SOCKET_URL));
        }
    }, [])

    const startWhatsapp = async (start: boolean, sessionId: WhatsappSessionTypes, removeSession?: boolean) => {
        const response: any = await (await startWhatsappServices(start, sessionId, removeSession)).json();
        return response;
    }

    const restartWhatsapp = async (sessionId: WhatsappSessionTypes) => {
        const response: any = await (await restartWhatsappServices(sessionId)).json();
        return response;
    }

    const closeWhatsapp = async (sessionId: WhatsappSessionTypes) => {
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
            const {status} = res;
            toast(`Whatsapp is ${status}`);
            setLogged(status === 'connected')
            setLoading(status !== 'connected')
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
        if (canvas && data) {
            QRCode.toCanvas(canvas, data, function (error) {
                if (error) console.error('qr error:', error);
            })
        }
    }

    const fetchWsSeedData = async (sessionId = whatsappSessionId, seedType: WhatsappSeedTypes) => {
        const emptySeed = seedData.groups?.length === 0 && seedData.users?.length === 0 && seedData.labels?.length === 0;
        setLoading(emptySeed)
        const data = await (await getWhatsappSeedData(sessionId, seedType)).json()
        if (!data.error) {
            const localData = JSON.parse(localStorageImpl.getItem(`${whatsappSeedStorePrefix}${sessionId}`) || '{}');
            localStorageImpl.setItem(`${whatsappSeedStorePrefix}${sessionId}`, JSON.stringify({...localData, ...data}));
            setSeedData({...seedData, ...data});
        }
        setLoading(false);
    }

    const fetchGroupParticipants = async (groupChatId: string) => {
        setLoading(true);
        const data = await (await getGroupChatParticipants(whatsappSessionId, groupChatId)).json();
        const localData = JSON.parse(localStorageImpl.getItem(`${whatsappSeedStorePrefix}${whatsappSessionId}`) || '{}');

        if (!data.error) {
            localData.groups = (localData.groups || []).map((group: any) => {
                if (group.id === groupChatId) {
                    group.participants = data.participants;
                }
                return group;
            });

            localStorageImpl.setItem(`${whatsappSeedStorePrefix}${whatsappSessionId}`, JSON.stringify({...localData}));

            setSeedData({...seedData, ...localData});
        }

        setLoading(false);

        return data.participants as IWsUser[];
    }

    // handling whatsapp service
    React.useEffect(() => {
        if (socket) {
            generateQr('init');
            socket.on(CONNECTED_EVENT, () => {
                onSocketOnce(socket, WhatsappEvents.ON_LOADING, ({loading}) => {
                    console.log('loading!!', loading)
                    setLoading(loading)
                })
                // generating qr code
                onSocketOnce(socket, WhatsappEvents.ON_QR, ({qrCode}) => {
                    generateQr(qrCode);
                    setLoading(false);
                });

                onSocketOnce(socket, WhatsappEvents.ON_AUTH_SUCCESS, ({sessionId}) => {
                    console.log('auth success', sessionId);
                    setLogged(true)
                    setLoading(false)
                });

                onSocketOnce(socket, WhatsappEvents.ON_AUTH_FAILED, async () => {
                    console.log('auth success');

                    setLogged(false)
                    setLoading(false);
                });

                onSocketOnce(socket, WhatsappEvents.ON_READY, () => {
                    console.log('auth success');
                    toast('¡Whatsapp listo para usar!');
                    setLoading(false);
                    setLogged(true)
                });

                onSocketOnce(socket, WhatsappEvents.ON_LOGOUT, () => {
                    toast('Sesión de Whatsapp Cerrada');
                    setLogged(false);
                });

                autologin && login(whatsappSessionId)
            })
        }

        return () => socket ? socket.disconnect() : {} as any;
    }, [socket]);

    const handleWhatsappMessaging = (sent: (contact: IClient) => any, end: (contacts: IClient[]) => any) => {
        if (socket) {
            onSocketOnce(socket, WhatsappEvents.ON_START_MESSAGE, () => setLoading(true));
            onSocketOnce(socket, WhatsappEvents.ON_SENT_MESSAGE, sent);
            onSocketOnce(socket, WhatsappEvents.ON_END_MESSAGE, (res) => {
                end(res);
                setLoading(false);
            });
        }
    }

    const sendMessage = async (sessionId: WhatsappSessionTypes, contacts: (IClient | IWsUser)[], message: IWhatsappMessage | IWhatsappMessage[]) => {
        const formData = new FormData();
        const messages = Array.isArray(message) ? message : [message];

        messages.forEach((message, index) => {

            if (message.media) {
                const {content, type, name} = message.media;
                if (content instanceof Blob) {
                    formData.append('media', content, name);
                    message.media = {
                        ...message.media,
                        content: index.toString(),
                    }
                }
            }
        });

        formData.append('messages', JSON.stringify(messages));
        formData.append('contacts', JSON.stringify(contacts));
        formData.append('sessionId', sessionId);

        const {stopMessagesId} = await sendWhatsappMessage(sessionId, formData);
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
        qrElement: <QrCanvas id="canvas-qr"/>,
        destroyWsClient,
        fetchWsSeedData,
        updateSeedDataWithLocalStorage,
        restartWhatsapp,
        stopMessaging,
        stopMessagingId,
        fetchGroupParticipants
    };

}

export default useWhatsapp
