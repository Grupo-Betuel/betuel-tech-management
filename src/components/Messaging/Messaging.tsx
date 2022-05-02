import { IClient } from "../../model/interfaces/ClientModel";
import React, { ChangeEvent, useState } from "react";
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
    const [selectedSession, setSelectedSession] = useState<WhatsappSessionTypes>(whatsappSessionKeys.wpadilla)
    const [message, setMessage] = useState<string>('')
    const [photo, setPhoto] = useState<any>()

    const {
        logged,
        loading,
        logOut,
        handleWhatsappMessaging,
        sendMessage,
        qrElement,
        login,
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
    const handleSendMessage = (sessionId: WhatsappSessionTypes, contacts: IClient[]) => async () => {
        const contactList = [
            {
                firstName: 'Luz',
                lastName: 'De Padilla',
                number: '8493846548',
            },
            {
                firstName: 'Williams',
                lastName: 'De Pena',
                number: '8094055531',
            },
        ]

        sendMessage(sessionId, contacts, {text: message, photo})
    }

    const onChangeMessage = (e: any) => {
        const {value} = e.target;
        setMessage(value);
    }

    const onSelectPhoto = async (event: any) => {

        const {files} = event.target;
        if (FileReader && files.length) {
            const fr = new FileReader();

            fr.onload = async () => {
                console.log(fr.result);
                setPhoto(fr.result);
            }

            fr.readAsDataURL(files[0]);
        }
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
                    <p className="mt-2">Puedes usar @firstName, @lastName y @number para personalizar el mensaje</p>
                    <textarea
                        className="mb-3 w-100"
                        onChange={onChangeMessage}
                        rows={10}
                    />

                    <div>
                        <input
                            onChange={onSelectPhoto}
                            type="file"
                            name="file"
                            accept="image/png,image/jpg,image/gif,image/jpeg"
                        />
                    </div>
                    <Button color="success" outline onClick={handleSendMessage(selectedSession, contacts)}>Send
                        Message</Button>
                </div>
            }
        </MessagingContainer>
    )
}

export default Messaging;
