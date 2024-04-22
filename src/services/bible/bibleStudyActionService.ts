import {BibleDayModel, BibleGroupModel, BibleStudyActionsModel} from "../../models/interfaces/BibleModel";

export const getBibleStudyActions = async () => {
    try {
        const response = await fetch(`${process.env.REACT_APP_API}bible/studies/actions`);
        return await response.json() as any;
    } catch (e) {
        throw e;
    }

};


export const updateBibleStudyAction = async (data: Partial<BibleStudyActionsModel>) => {
    const body = JSON.stringify(data);
    try {
        return await fetch(`${process.env.REACT_APP_API}bible/studies/actions`, {
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

export const deleteBibleStudyAction = async (_id: string) => {
    try {
        return await fetch(`${process.env.REACT_APP_API}bible/studies/actions`, {
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

export const addBibleStudyAction = async (data: BibleStudyActionsModel) => {
    const body = JSON.stringify(data);

    try {
        return await fetch(`${process.env.REACT_APP_API}bible/studies/actions`, {
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

export const runBibleStudyAction = async (data: {
    group: BibleGroupModel,
    action: BibleStudyActionsModel,
    day: BibleDayModel
}) => {
    const body = JSON.stringify(data);

    try {
        return await fetch(`${process.env.REACT_APP_PROMOTION_API}bible/actions/run`, {
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
