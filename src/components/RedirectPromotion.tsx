import {useEffect} from "react";

export const RedirectPromotion = () => {

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const message = `Hola vi los productos de ${queryParams.get('company') || 'betueldance'} en ${queryParams.get('from') || 'linea'} y quiero saber más`;
        location.href = `https://api.whatsapp.com/send/?phone=18298937075&text=${message}`;
    }, [])
    return (
        <div>

        </div>
    )
}
