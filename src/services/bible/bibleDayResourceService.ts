import {BibleDayResourcesModel} from "../../models/interfaces/BibleModel";

export const getBibleDayResources = async () => {
    try {
        const response = await fetch(`${process.env.REACT_APP_API}bible/days/resources`);
        return await response.json() as any;
    } catch (e) {
        throw e;
    }

};


export const updateBibleDayResource = async (data: Partial<BibleDayResourcesModel>) => {
    const body = JSON.stringify(data);
    try {
        return await fetch(`${process.env.REACT_APP_API}bible/days/resources`, {
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

export const deleteBibleDayResource = async (_id: string) => {
    try {
        return await fetch(`${process.env.REACT_APP_API}bible/days/resources`, {
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

export const addBibleDayResource = async (data: BibleDayResourcesModel) => {
    const body = JSON.stringify(data);

    try {
        return await fetch(`${process.env.REACT_APP_API}bible/days/resources`, {
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

