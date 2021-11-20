export const getSales = async (date?: string) => {
    try {
        const response = await fetch(`${process.env.REACT_APP_API}sales/?date=${date}`);
        return await response.json() as any;
    } catch (e) {
        throw e;
    }

};

export const getRecordedDates = async () => {
    try {
        const response = await fetch(`${process.env.REACT_APP_API}sales/months`);
        return await response.json() as any || [];
    } catch (e) {
        throw e;
    }
}

export const updateSales = async (body: string) => {
    try {
        return await fetch(`${process.env.REACT_APP_API}sales`, {
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

export const deleteSale = async (body: string) => {
    try {
        return await fetch(`${process.env.REACT_APP_API}sales`, {
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

export const addSales = async (body: string) => {
    try {
        return await fetch(`${process.env.REACT_APP_API}sales`, {
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
