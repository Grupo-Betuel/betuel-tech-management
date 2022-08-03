import { IProduct } from "../components/Product/Product";
import { IClient } from "../model/interfaces/ClientModel";
import { IWhatsappMessage, WhatsappSessionTypes } from "../model/interfaces/WhatsappModels";

export const localPromotionsApi = 'http://10.0.0.13:5000/api/';
export const whatsappPhone = '+18298937075';
export type ECommerceTypes = 'facebook' | 'corotos' | 'flea' | 'whatsapp';
export const ecommerceNames: { [N in ECommerceTypes]: string } = {
    facebook: 'Facebook Marketplace',
    corotos: 'Corotos',
    flea: 'La Pulga Virtual',
    whatsapp: 'Whatsapp Messenger',
}
export const getWhatsappMessageURL = (message: string) => `https://wa.me/${whatsappPhone}?text=${encodeURI(message)}`;



export const promoteProduct = async (products: IProduct[], eCommerce: ECommerceTypes, sessionKey: string = 'betueltech') => {
    const body = JSON.stringify({ data: products, sessionKey });

    try {
        // `${eCommerce !== 'facebook' ? process.env.REACT_APP_PROMOTION_API : localPromotionsApi}${eCommerce}`
        return await fetch(`${process.env.REACT_APP_PROMOTION_API}${eCommerce}`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body,
            }
        );
    } catch (e) {
        throw e;
    }
}


export const startWhatsappServices = async (start = true, sessionId: WhatsappSessionTypes) => {
    try {
        return await fetch(`${process.env.REACT_APP_PROMOTION_API}whatsapp`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({start, sessionId}),
            }
        );
    } catch (e) {
        throw e;
    }
}

export const sendWhatsappMessage = async (sessionId: WhatsappSessionTypes, contacts: IClient[], message: IWhatsappMessage) => {
    console.log(contacts, 'clients');
    try {
        return await fetch(`${process.env.REACT_APP_PROMOTION_API}whatsapp/message`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionId,
                    message,
                    contacts: contacts.filter(item => !!item),
                }),
            }
        );
    } catch (e) {
        throw e;
    }
}
