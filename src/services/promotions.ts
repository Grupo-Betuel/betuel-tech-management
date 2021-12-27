import { IProduct } from "../components/Product/Product";

export const promotionsApi = 'http://10.0.0.13:5000/api/';

export const getWhatsappMessageURL = (message: string) => `https://wa.me/+18298937075?text=${encodeURI(message)}`;
export const publishInFacebookMarketplace = async (products: IProduct[]) => {
    const body = JSON.stringify(products);

    try {
        return await fetch(`${promotionsApi}facebook`, {
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
