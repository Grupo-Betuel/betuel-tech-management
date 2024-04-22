import {BibleDayModel} from "../../models/interfaces/BibleModel";

export const getBibleDays = async () => {
    try {
        const response = await fetch(`${process.env.REACT_APP_API}bible/days`);
        return await response.json() as any;
    } catch (e) {
        throw e;
    }

};


export const updateBibleDay = async (data: Partial<BibleDayModel>) => {
    const body = JSON.stringify(data);
    try {
        return await fetch(`${process.env.REACT_APP_API}bible/days`, {
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

export const deleteBibleDay = async (_id: string) => {
    try {
        return await fetch(`${process.env.REACT_APP_API}bible/days`, {
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

export const addBibleDay = async (data: BibleDayModel) => {
    const body = JSON.stringify(data);

    try {
        return await fetch(`${process.env.REACT_APP_API}bible/days`, {
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
