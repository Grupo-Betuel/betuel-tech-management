
export const getCompanies = async () => {
    try {
        const response = await fetch(`${process.env.REACT_APP_API}companies`);
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

export const updateCompanies = async (body: string) => {
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

export const addCompanies = async (body: string) => {
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
