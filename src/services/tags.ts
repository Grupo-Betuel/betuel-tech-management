export const getTags = async () => {
    try {
        const response = await fetch(`${process.env.REACT_APP_API}tags`);
        return await response.json() as any;
    } catch (e) {
        throw e;
    }

};

export const updateTags = async (body: string) => {
    try {
        return await fetch(`${process.env.REACT_APP_API}tags`, {
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

export const deleteTag = async (body: string) => {
    try {
        return await fetch(`${process.env.REACT_APP_API}tags`, {
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

export const addTag = async (body: string) => {
    try {
        return await fetch(`${process.env.REACT_APP_API}tags`, {
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
