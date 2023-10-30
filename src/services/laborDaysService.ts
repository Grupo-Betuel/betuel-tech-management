export const getLaborDays = async () => {
    try {
        const response = await fetch(`${process.env.REACT_APP_API}labor-days`);
        return await response.json() as any;
    } catch (e) {
        throw e;
    }

};

export const updateLaborDays = async (body: string) => {
    try {
        return await fetch(`${process.env.REACT_APP_API}labor-days`, {
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

export const deleteLaborDay = async (body: string) => {
    try {
        return await fetch(`${process.env.REACT_APP_API}labor-days`, {
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

export const addLaborDay = async (body: string) => {
    try {
        return await fetch(`${process.env.REACT_APP_API}labor-days`, {
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
