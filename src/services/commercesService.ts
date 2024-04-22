import {CommerceModel} from "../models/commerceModels";

export const getCommerces = async () => {
    try {
        const response = await fetch(`${process.env.REACT_APP_API}commerces`);
        return await response.json() as any;
    } catch (e) {
        throw e;
    }

};


export const updateCommerce = async (data: Partial<CommerceModel>) => {
    const body = JSON.stringify(data);
    try {
        return await fetch(`${process.env.REACT_APP_API}commerces`, {
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

export const deleteCommerce = async (body: string) => {
    try {
        return await fetch(`${process.env.REACT_APP_API}commerces`, {
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

export const addCommerce = async (data: CommerceModel) => {
    const body = JSON.stringify(data);

    try {
        return await fetch(`${process.env.REACT_APP_API}commerces`, {
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
