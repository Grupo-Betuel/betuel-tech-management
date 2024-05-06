import {BibleUserModel} from "../../models/interfaces/BibleModel";

export const getBibleUsers = async () => {
    try {
        const response = await fetch(`${process.env.REACT_APP_API}bible/users`);
        return await response.json() as BibleUserModel[];
    } catch (e) {
        throw e;
    }

};


export const getBibleUserByPhone = async (phone: string) => {
    try {
        const response = await fetch(`${process.env.REACT_APP_API}bible/users/by-phone/${phone}`);
        return await response.json() as BibleUserModel;
    } catch (e) {
        throw e;
    }

};


export const updateBibleUser = async (data: Partial<BibleUserModel>) => {
    const body = JSON.stringify(data);
    try {
        return await fetch(`${process.env.REACT_APP_API}bible/users`, {
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

export const deleteBibleUser = async (_id: string) => {
    try {
        return await fetch(`${process.env.REACT_APP_API}bible/users`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({_id})
            }
        );

    } catch (e) {
        throw e;
    }
}

export const addBibleUser = async (data: BibleUserModel) => {
    const body = JSON.stringify(data);

    try {
        return await fetch(`${process.env.REACT_APP_API}bible/users`, {
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


export const syncBibleUser = async (whatsappUserID: string) => {
    const body = JSON.stringify({whatsappUserID});

    try {
        return await fetch(`${process.env.REACT_APP_PROMOTION_API}whatsapp/sync-bible-group`, {
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
