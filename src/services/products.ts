export const getProducts = async () => {
    try {
        const response = await fetch(`${process.env.REACT_APP_API}products`);
        return await response.json() as any;
    } catch (e) {
        throw e;
    }

};

export const updateProducts = async (body: string) => {
    try {
        return await fetch(`${process.env.REACT_APP_API}products`, {
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

export const deleteProduct = async (body: string) => {
    try {
        return await fetch(`${process.env.REACT_APP_API}products`, {
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

export const addProduct = async (body: string) => {
    try {
        return await fetch(`${process.env.REACT_APP_API}products`, {
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
