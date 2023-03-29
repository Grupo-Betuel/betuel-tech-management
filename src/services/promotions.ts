import { IProduct } from "../components/Product/Product";
import { IClient } from "../model/interfaces/ClientModel";
import {
  IWhatsappMessage,
  IWsUser,
  WhatsappSessionTypes,
} from "../model/interfaces/WhatsappModels";

export const localPromotionsApi = "http://10.0.0.13:5000/api/";
export const whatsappPhone = "+18298937075";
export type ECommerceTypes =
  | "facebook"
  | "corotos"
  | "flea"
  | "whatsapp"
  | "betueltravel";
export const ecommerceNames: { [N in ECommerceTypes]: string } = {
  facebook: "Facebook Marketplace",
  corotos: "Corotos",
  flea: "La Pulga Virtual",
  whatsapp: "Whatsapp Messenger",
  betueltravel: "Betuel Travel",
};
export const getWhatsappMessageURL = (message: string) =>
  `https://wa.me/${whatsappPhone}?text=${encodeURI(message)}`;

export const promoteProduct = async (
  products: IProduct[],
  eCommerce: ECommerceTypes,
  sessionKey: string
) => {
  const body = JSON.stringify({ data: products, sessionKey });

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
    return await fetch(`${process.env.REACT_APP_PROMOTION_API}whatsapp`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ start, sessionId, removeSession }),
    });
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
