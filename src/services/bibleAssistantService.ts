import {ExpenseModel as DataModel} from "../model/expenseModel";
import {BibleDays, BibleGroups} from "../model/interfaces/BibleModel";

export const getBibleDays = async () => {
    try {
        const response = await fetch(`${process.env.REACT_APP_API}bible/days`);
        return await response.json() as BibleDays[];
    } catch (e) {
        throw e;
    }

};


export const getBibleGroups = async () => {
    try {
        const response = await fetch(`${process.env.REACT_APP_API}bible/groups`);
        return await response.json() as BibleGroups[];
    } catch (e) {
        throw e;
    }

};


export const updateData = async (data: Partial<DataModel>) => {
    const body = JSON.stringify(data);
    try {
        return await fetch(`${process.env.REACT_APP_API}bible/`, {
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

export const deleteData = async (_id: string) => {
    try {
        return await fetch(`${process.env.REACT_APP_API}bible/`, {
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

export const addData = async (data: DataModel) => {
    const body = JSON.stringify(data);

    try {
        return await fetch(`${process.env.REACT_APP_API}bible/`, {
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
