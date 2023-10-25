import {IProduct} from "../components/Product/Product";
import {IClient} from "../model/interfaces/ClientModel";
import {
    IWhatsappMessage,
    IWsUser,
    WhatsappSessionTypes,
} from "../model/interfaces/WhatsappModels";
import {generateProductDescriptionFromParams} from "../utils/promotion.utils";

export const localPromotionsApi = "http://10.0.0.13:5000/api/";
export const whatsappPhone = "+18298937075";
export type PublicationTypes = "photo" | "story";
export type ECommerceTypes =
    | "facebook"
    | "instagram"
    | "corotos"
    | "flea"
    | "whatsapp"
    | "betueltravel"
    | "betueldance"
    | "betueltech";

export const ecommerceNames: { [N in ECommerceTypes | string]: string } = {
    facebook: "Facebook Marketplace",
    instagram: "Instagram",
    corotos: "Corotos",
    flea: "La Pulga Virtual",
    whatsapp: "Whatsapp Messenger",
    betueltravel: "Betuel Travel",
    betueltech: "Betuel Tech",
    betueldance: "Betuel Dance Shop",
};
export const getWhatsappMessageURL = (message: string) =>
    `https://wa.me/${whatsappPhone}?text=${encodeURI(message)}`;

export const getWhatsappNumberURl = (phone: string, message?: string) =>     `https://wa.me/${phone}?text=${encodeURI(message || '')}`;

export const promoteProduct = async (
    products: IProduct[],
    eCommerce: ECommerceTypes,
    sessionKey: string,
    type?: 'photo' | 'story',
) => {

    // manipulating descripttion
    // const productsData = products.map((product) => ({
        // ...product,
        // description: `${product.description}${product.productParams.length ? '\n\n' + generateProductDescriptionFromParams(product.productParams) : ''}`,
    // }));

    const body = JSON.stringify({data: products, sessionKey, type});

    try {
        // `${eCommerce !== 'facebook' ? process.env.REACT_APP_PROMOTION_API : localPromotionsApi}${eCommerce}`
        return await fetch(`${process.env.REACT_APP_PROMOTION_API}${eCommerce}`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body,
        });
    } catch (e) {
        throw e;
    }
};

export const startWhatsappServices = async (
    start = true,
    sessionId: WhatsappSessionTypes,
    removeSession?: boolean
) => {
    try {
        return await fetch(`${process.env.REACT_APP_PROMOTION_API}whatsapp/start`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({start, sessionId, removeSession}),
        });
    } catch (e) {
        throw e;
    }
};

export const restartWhatsappServices = async (
    sessionId: WhatsappSessionTypes,
) => {
    try {
        return await fetch(`${process.env.REACT_APP_PROMOTION_API}whatsapp/restart`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({sessionId}),
        });
    } catch (e) {
        throw e;
    }
};


export const closeWhatsappServices = async (
    sessionId: WhatsappSessionTypes,
) => {
    try {
        return await fetch(`${process.env.REACT_APP_PROMOTION_API}whatsapp/close`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({sessionId}),
        });
    } catch (e) {
        throw e;
    }
};

export const handleSchedulePromotion = async (
    clientId: string,
    action: 'run' | 'stop' = 'run'
) => {
    try {
        return await fetch(`${process.env.REACT_APP_PROMOTION_API}schedule`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({action, clientId}),
        });
    } catch (e) {
        throw e;
    }
};


export const getScheduleStatus = async (
    clientId: string,
) => {
    try {
        return await (await fetch(`${process.env.REACT_APP_PROMOTION_API}schedule/status`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({clientId}),
        })).json();
    } catch (e) {
        throw e;
    }
};


export const sendWhatsappMessage = async (
    sessionId: WhatsappSessionTypes,
    contacts: (IClient | IWsUser)[],
    message: IWhatsappMessage
) => {
    try {
        return await fetch(
            `${process.env.REACT_APP_PROMOTION_API}whatsapp/message`,
            {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    sessionId,
                    message,
                    contacts: contacts.filter((item) => !!item),
                    delay: 10,
                }),
            }
        );
    } catch (e) {
        throw e;
    }
};

export const getWhatsappSeedData = async (
    sessionId: WhatsappSessionTypes,
    seedType = "all"
) => {
    try {
        return await fetch(
            `${process.env.REACT_APP_PROMOTION_API}whatsapp/seed/${sessionId}/${seedType}`,
            {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
            }
        );
    } catch (e) {
        throw e;
    }
};
