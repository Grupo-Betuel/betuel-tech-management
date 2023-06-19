export const login = async (body: string) => {
    try {
        return await fetch(`${process.env.REACT_APP_API}login`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Request-Method': 'POST',
                },
                body,
            }
        );
    } catch (e) {
        throw e;
    }

}
