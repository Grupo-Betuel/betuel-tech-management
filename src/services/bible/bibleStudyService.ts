import {
    BibleDayModel,
    BibleGroupModel,
    BibleStudyActionsModel,
    BibleStudyModel
} from "../../model/interfaces/BibleModel";
import {ScheduleResponse} from "../../model/schedule";

export const getBibleStudies = async () => {
    try {
        const response = await fetch(`${process.env.REACT_APP_API}bible/studies`);
        return await response.json() as BibleStudyModel[];
    } catch (e) {
        throw e;
    }

};

export const getBibleStudyStatus = async (studyId: string): Promise<ScheduleResponse | any> => {
    const body = JSON.stringify({studyId});
    try {
        return await (await fetch(`${process.env.REACT_APP_PROMOTION_API}schedule/bible-assistance/status`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body,
            }
        )).json() as Promise<ScheduleResponse>

    } catch (e) {
        throw e;
    }

};




export const updateBibleStudy = async (data: Partial<BibleStudyModel>) => {
    const body = JSON.stringify(data);
    try {
        return await fetch(`${process.env.REACT_APP_API}bible/studies`, {
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

export const addGroupToBibleStudy = async (data: { group: BibleGroupModel, study: BibleStudyModel }) => {
    const body = JSON.stringify(data);
    try {
        return await fetch(`${process.env.REACT_APP_API}bible/studies/add-group`, {
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

export const addDayToBibleStudy = async (data: { day: BibleDayModel, study: BibleStudyModel }) => {
    const body = JSON.stringify(data);
    try {
        return await fetch(`${process.env.REACT_APP_API}bible/studies/add-day`, {
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


export const addActionToBibleStudy = async (data: { action: BibleStudyActionsModel, study: BibleStudyModel }) => {
    const body = JSON.stringify(data);
    try {
        return await fetch(`${process.env.REACT_APP_API}bible/studies/add-action`, {
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

export const deleteBibleStudy = async (_id: string) => {
    try {
        return await fetch(`${process.env.REACT_APP_API}bible/studies`, {
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

export const addBibleStudy = async (data: BibleStudyModel) => {
    const body = JSON.stringify(data);

    try {
        return await fetch(`${process.env.REACT_APP_API}bible/studies`, {
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
