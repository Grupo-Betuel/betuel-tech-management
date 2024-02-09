import {ExpenseModel} from "../model/expenseModel";

export const getExpenses = async () => {
    try {
        const response = await fetch(`${process.env.REACT_APP_API}expenses`);
        return await response.json() as any;
    } catch (e) {
        throw e;
    }

};


export const updateExpense = async (data: Partial<ExpenseModel>) => {
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

export const deleteExpense = async (_id: string) => {
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

export const addExpense = async (data: ExpenseModel) => {
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
