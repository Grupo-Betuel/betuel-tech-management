export const getClients = async (page?: number) => {
    try {
        // /?page=${page}
        const response = await fetch(`${process.env.REACT_APP_API}clients`);
        return await response.json() as any;
    } catch (e) {
        throw e;
    }

};


export const updateClients = async (body: string) => {
    try {
        return await fetch(`${process.env.REACT_APP_API}clients`, {
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


export const addTagsToClients = async (body: string) => {
    try {
        return await fetch(`${process.env.REACT_APP_API}clients/add-tags-to-clients`, {
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

export const deleteClient = async (body: string) => {
    try {
        return await fetch(`${process.env.REACT_APP_API}clients`, {
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

export const addClient = async (body: string) => {
    try {
        return await fetch(`${process.env.REACT_APP_API}clients`, {
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
