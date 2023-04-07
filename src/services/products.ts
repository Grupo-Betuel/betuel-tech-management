import {deletePhoto} from "./gcloud";
import {CompanyTypes} from "../model/common";

export const getProducts = async (company: CompanyTypes) => {
    try {
        const response = await fetch(`${process.env.REACT_APP_API}products/${company}`);
        return await response.json() as any;
    } catch (e) {
        throw e;
    }

};

export const deleteProduct = async (id: string) => {
    try {
        const response = await fetch(`${process.env.REACT_APP_API}products/${id}`, {
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

export const updateProducts = async (body: string, filenameToDelete?: string, productImageToDelete?: string) => {

    try {
        if (filenameToDelete) {
            const deletedResponse = await deletePhoto(filenameToDelete);
            if (deletedResponse.status !== 204) {
                console.error(deletedResponse);
            }
        }

        if (productImageToDelete) {
            const deletedProductImageResponse = await deletePhoto(productImageToDelete);
            if (deletedProductImageResponse.status !== 204) {
                console.error(deletedProductImageResponse);
            }
        }
        return await fetch(`${process.env.REACT_APP_API}products`, {
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
