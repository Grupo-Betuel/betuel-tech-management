import { BibleGroupParticipationModel } from "../../model/interfaces/BibleModel";

export const getBibleGroupParticipations = async () => {
    try {
        const response = await fetch(`${process.env.REACT_APP_API}bible/groups/participations`);
        return await response.json() as BibleGroupParticipationModel[];
    } catch (e) {
        throw e;
    }

};



export const updateBibleGroupParticipation = async (data: Partial<BibleGroupParticipationModel>) => {
    const body = JSON.stringify(data);
    // return;
    try {
        return await fetch(`${process.env.REACT_APP_API}bible/groups/participations`, {
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

export const deleteBibleGroupParticipation = async (_id: string) => {
    try {
        return await fetch(`${process.env.REACT_APP_API}bible/groups/participations`, {
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

export const addBibleGroupParticipation = async (data: BibleGroupParticipationModel) => {
    const body = JSON.stringify(data);

    try {
        return await fetch(`${process.env.REACT_APP_API}bible/groups/participations`, {
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
