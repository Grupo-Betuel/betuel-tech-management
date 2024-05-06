import { BibleGroupModel} from "../../models/interfaces/BibleModel";

export const getBibleGroups = async () => {
    try {
        const response = await fetch(`${process.env.REACT_APP_API}bible/groups`);
        return await response.json() as BibleGroupModel[];
    } catch (e) {
        throw e;
    }

};



export const updateBibleGroup = async (data: Partial<BibleGroupModel>) => {
    const body = JSON.stringify(data);
    try {
        return await fetch(`${process.env.REACT_APP_API}bible/groups`, {
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

export const deleteBibleGroup = async (_id: string) => {
    try {
        return await fetch(`${process.env.REACT_APP_API}bible/groups`, {
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

export const addBibleGroup = async (data: BibleGroupModel) => {
    const body = JSON.stringify(data);

    try {
        return await fetch(`${process.env.REACT_APP_API}bible/groups`, {
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



export const syncBibleGroup = async (whatsappGroupID: string) => {
    const body = JSON.stringify({ whatsappGroupID });

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
