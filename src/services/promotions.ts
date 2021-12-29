import { IProduct } from "../components/Product/Product";

export const promotionsApi = 'http://10.0.0.13:5000/api/';
export const whatsappPhone = '+18298937075';
export type ECommerceTypes = 'facebook' | 'corotos' | 'flea';
export const ecommerceNames: { [N in ECommerceTypes]: string } = {
    facebook: 'Facebook Marketplace',
    corotos: 'Corotos',
    flea: 'La Pulga Virtual'
}
export const getWhatsappMessageURL = (message: string) => `https://wa.me/${whatsappPhone}?text=${encodeURI(message)}`;
export const promoteProduct = async (products: IProduct[], eCommerce: ECommerceTypes) => {
    const body = JSON.stringify(products);

    try {
        return await fetch(`${promotionsApi}${eCommerce}`, {
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
