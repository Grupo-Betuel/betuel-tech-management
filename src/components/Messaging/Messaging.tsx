import { IClient } from "../../model/interfaces/ClientModel";
import React, { useState } from "react";
import styled from "styled-components";
import { Button, Spinner } from "reactstrap";
import { toast } from "react-toastify";
import useWhatsapp from "../hooks/UseWhatsapp";
import { TagContainer, TagItem } from "../Tag/Tag";
import {
    whatsappSessionKeys,
    whatsappSessionList,
    whatsappSessionNames,
    WhatsappSessionTypes
} from "../../model/interfaces/WhatsappModels";

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
    const [selectedSession, setSelectedSession] = useState<WhatsappSessionTypes>(whatsappSessionKeys.betueltgroup)

    const {
        logged,
        loading,
        logOut,
        handleWhatsappMessaging,
        sendMessage,
        qrElement,
        login,
        setLogged,
        setLoading,
    } = useWhatsapp(selectedSession);

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

    const changeSession = (sessionKey: WhatsappSessionTypes) => {
        login(sessionKey)
    }

    const selectSession = (sessionKey: WhatsappSessionTypes) => () => {
        setSelectedSession(sessionKey)
        changeSession(sessionKey)
    }

    return (
        <MessagingContainer className="position-relative">
            <TagContainer className="d-flex w-100">
                {
                    whatsappSessionList.map((sessionKey, key) => (
                        <TagItem onClick={selectSession(sessionKey)}
                                 selected={selectedSession === sessionKey} key={key}>
                            <span>{whatsappSessionNames[sessionKey]}</span>
                        </TagItem>
                    ))
                }
            </TagContainer>
            {logged && <LogOutButton
              title="Cerrar Sesión"
              className="bi bi-power text-danger log-out-icon cursor-pointer"
              onClick={() => logOut(selectedSession)}/>}
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
                </div>
                :

                <div>
                    <h3 className="text-center mb-3">Enviar Mensaje</h3>
                    <textarea
                        className="mb-3 w-100"
                        rows={10}
                    />
                    <Button color="success" outline onClick={sendMessage(selectedSession, contacts)}>Send Message</Button>
                </div>
            }
        </MessagingContainer>
    )
}

export default Messaging;
