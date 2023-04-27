export const getFlyerTemplates = async () => {
    try {
        const response = await fetch(`${process.env.REACT_APP_API}flyer-templates`);
        return await response.json() as any;
    } catch (e) {
        throw e;
    }

};


export const updateFlyerTemplate = async (body: string) => {
    try {
        return await fetch(`${process.env.REACT_APP_API}flyer-templates`, {
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

export const deleteFlyerTemplate = async (body: string) => {
    try {
        return await fetch(`${process.env.REACT_APP_API}flyer-templates`, {
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

export const addFlyerTemplate = async (body: string) => {
    try {
        return await fetch(`${process.env.REACT_APP_API}flyer-templates`, {
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
