import { IClient } from "../../model/interfaces/ClientModel";
import React from "react";
import styled from "styled-components";
import { Button, Spinner } from "reactstrap";
import { toast } from "react-toastify";
import useWhatsapp from "../hooks/UseWhatsapp";

export interface IMessaging {
    contacts: IClient[]
}

export const LogOutButton = styled.i`
  position: absolute;
  right: 10px;
  top: 0px;
  font-size: 25px;
`

export const MessagingContainer = styled.div`
`
const Messaging: React.FC<IMessaging> = (
    {
        contacts,
    }
) => {

    const {
        logged,
        loading,
        logOut,
        handleWhatsappMessaging,
        sendMessage,
        qrElement
    } = useWhatsapp();

    const onMessageSent = (contact: IClient) => {
        console.log('contact', contact)
        toast(`Mensaje enviado a ${contact.firstName}`);
    }

    const onMessageEnd = (contacts: IClient[]) => {
        toast('¡Mensajes Enviados con Exito!', {type: 'success'});
    }

    // handling whatsapp service
    React.useEffect(() => {
        handleWhatsappMessaging(onMessageSent, onMessageEnd);
    }, []);

    return (
        <MessagingContainer className="position-relative">
            {logged && <LogOutButton
              title="Cerrar Sesión"
              className="bi bi-power text-danger log-out-icon cursor-pointer"
              onClick={logOut}/>}
            {
                loading ?
                    (
                        <div className="loading-sale-container">
                            <Spinner animation="grow" variant="secondary"/>
                        </div>
                    ) : null
            }
            {!logged ?
                <div>
                    <h3 className="text-center mb-3">Escanear con Whatsapp</h3>
                    {qrElement}
                    {/*<QrElement id="canvas-qr" className="whatsapp-qr"/>*/}
                </div>
                :

                <div>
                    <h3 className="text-center mb-3">Enviar Mensaje</h3>
                    <textarea
                        className="mb-3 w-100"
                        rows={10}
                    />
                    <Button color="success" outline onClick={sendMessage(contacts)}>Send Message</Button>
                </div>
            }
        </MessagingContainer>
    )
}

export default Messaging;
