
export const getCompanies = async () => {
    try {
        const response = await fetch(`${process.env.REACT_APP_API}companies`,{
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Access-Control-Request-Headers': "*"
            }
        });
        return await response.json() as any;
    } catch (e) {
        throw e;
    }

};

export const updateCompanies = async (body: string) => {
    try {
        return await fetch(`${process.env.REACT_APP_API}companies`, {
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

    export const deleteCompany = async (body: string) => {
    try {
        return await fetch(`${process.env.REACT_APP_API}companies`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': "*"
                },
                body,
            }
        );

    } catch (e) {
        throw e;
    }
}

export const addCompany = async (body: string) => {
    try {
        return await fetch(`${process.env.REACT_APP_API}companies`, {
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
