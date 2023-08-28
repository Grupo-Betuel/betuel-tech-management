import {deletePhoto} from "./gcloud";

export const getProducts = async (company: string) => {
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

export const updateProducts = async (body: string, filenameToDelete?: string) => {

    try {
        if (filenameToDelete) {
            const deletedResponse = await deletePhoto(filenameToDelete);
            if (deletedResponse.status !== 204) {
                console.error(deletedResponse);
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