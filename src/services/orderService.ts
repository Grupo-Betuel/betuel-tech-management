import {deletePhoto} from "./gcloud";
import {CompanyTypes} from "../model/common";
import {IOrder} from "../model/ordersModels";
import {CurrencyData} from "../model/interfaces/rateModels";

export const getOrders = async () => {
    try {
        const response = await fetch(`${process.env.REACT_APP_API}orders`);
        return await response.json() as IOrder[];
    } catch (e) {
        throw e;
    }

};


export const getOrderById = async (id: string) => {
    try {
        const response = await fetch(`${process.env.REACT_APP_API}orders/by-id/${id}`);
        return await response.json() as IOrder;
    } catch (e) {
        throw e;
    }

};

export const deleteOrder = async (body: string) => {
    try {
        return await fetch(`${process.env.REACT_APP_API}orders`, {
                method: 'DELETE',
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

export const updateOrder = async (body: string) => {

    try {

        return await fetch(`${process.env.REACT_APP_API}orders`, {
                method: 'PUT',
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

export const refreshBotOrders = async () => {
    try {
        const response = await fetch(`${process.env.REACT_APP_PROMOTION_API}whatsapp/refresh-bot-orders`);
        return await response.json() as any;
    } catch (e) {
        throw e;
    }

};

export const handleOrderWithBot = async (body: string) => {
    try {
        const response = await fetch(`${process.env.REACT_APP_PROMOTION_API}whatsapp/handle-order`,
            {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body,
            });
        return await response.json() as any;
    } catch (e) {
        throw e;
    }

};

export const addProduct = async (body: string) => {
    try {
        return await fetch(`${process.env.REACT_APP_API}products`, {
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


export const deleteProductParam = async (id: string) => {
    try {
        const response = await fetch(`${process.env.REACT_APP_API}products/param/${id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            }
        );
        return response;
    } catch (e) {
        throw e;
    }

};