import {ExpenseModel as DataModel} from "../models/expenseModel";

export const getDatas = async () => {
    try {
        const response = await fetch(`${process.env.REACT_APP_API}expenses`);
        return await response.json() as any;
    } catch (e) {
        throw e;
    }

};


export const updateData = async (data: Partial<DataModel>) => {
    const body = JSON.stringify(data);
    try {
        return await fetch(`${process.env.REACT_APP_API}expenses`, {
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
        return await fetch(`${process.env.REACT_APP_API}expenses`, {
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
        return await fetch(`${process.env.REACT_APP_API}expenses`, {
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
