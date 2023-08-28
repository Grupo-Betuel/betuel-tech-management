import {CompanyTypes} from "../model/common";

export const getCategories = async (companyId: string) => {
    try {
        const response = await fetch(`${process.env.REACT_APP_API}categories/by-company/${companyId}`);
        return await response.json() as any;
    } catch (e) {
        throw e;
    }

};

export const updateCategory = async (body: string) => {
    try {
        return await fetch(`${process.env.REACT_APP_API}categories`, {
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

export const deleteCategory = async (body: string) => {
    try {
        return await fetch(`${process.env.REACT_APP_API}categories`, {
                method: 'DELETE',
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

export const addCategory = async (body: string) => {
    try {
        return await fetch(`${process.env.REACT_APP_API}categories`, {
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
