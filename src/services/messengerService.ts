import {IMessenger} from "../models/messengerModels";

export const getMessengers = async () => {
    try {
        const response = await fetch(`${process.env.REACT_APP_API}messengers`);
        return await response.json() as IMessenger[];
    } catch (e) {
        throw e;
    }

};

export const updateMessenger = async (body: string) => {

    try {

        return await fetch(`${process.env.REACT_APP_API}messengers`, {
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

export const updateMultipleMessenger = async (body: string) => {

    try {

        return await fetch(`${process.env.REACT_APP_API}messengers/multiple`, {
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


export const addMessenger = async (body: string) => {

    try {

        return await fetch(`${process.env.REACT_APP_API}messengers`, {
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

export const deleteMessenger = async (body: string) => {
    try {
        return await fetch(`${process.env.REACT_APP_API}messengers`, {
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
