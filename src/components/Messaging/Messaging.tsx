import { IClient } from "../../model/interfaces/ClientModel";
import React, { ChangeEvent, useState } from "react";
import styled from "styled-components";
import { Button, Spinner } from "reactstrap";
import { toast } from "react-toastify";
import useWhatsapp from "../hooks/UseWhatsapp";
import { TagContainer, TagItem } from "../Tag/Tag";
import {
    IWsGroup,
    IWsLabel, IWsUser,
    whatsappSessionKeys,
    whatsappSessionList,
    whatsappSessionNames,
    WhatsappSessionTypes
} from "../../model/interfaces/WhatsappModels";
import { Multiselect } from "multiselect-react-dropdown";

export interface IMessaging {
    contacts: IClient[],
}

export const ImageWrapper = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  padding: 12px;

  img {
    max-width: 200px;
    border-radius: 5px;
    border: 6px solid #95b895;
  }

`
export const LogOutButton = styled.i`
  position: absolute;
  right: 10px;
  top: 0px;
  font-size: 25px;
`

export const DoubleSelectableWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
`


export const MessagingContainer = styled.div`
`

const Messaging: React.FC<IMessaging> = (
    {
        contacts,
    }
) => {
    const [selectedSession, setSelectedSession] = useState<WhatsappSessionTypes>(whatsappSessionKeys.betuelgroup)
    const [message, setMessage] = useState<string>('')
    const [photo, setPhoto] = useState<any>()
    const [labeledUsers, setLabeledUsers] = React.useState<IWsUser[]>([]);
    const [groupedUsers, setGroupedUsers] = React.useState<IWsUser[]>([]);
    const [excludedWhatsappUsers, setExcludedWhatsappUsers] = React.useState<IWsUser[]>([]);
    const [selectedWhatsappUsers, setSelectedWhatsappUsers] = React.useState<IWsUser[]>([]);
    const lastSession = React.useRef<WhatsappSessionTypes>();
    React.useEffect(() => {
        lastSession.current = selectedSession
    }, [selectedSession]);

    const {
        logged,
        loading,
        logOut,
        handleWhatsappMessaging,
        sendMessage,
        qrElement,
        login,
        seedData,
        destroyWsClient,
        fetchWsSeedData
    } = useWhatsapp(selectedSession);

    React.useEffect(() => {
        return (session = selectedSession) => {
            if(!logged) {
                !!lastSession.current && destroyWsClient(lastSession.current)
            }
        }
    }, []);

    // React.useEffect(() => {
    //     if(logged) {
    //         fetchWsSeedData(selectedSession)
    //     }
    // }, [logged]);

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
    }, [logged]);

    const changeSession = (sessionKey: WhatsappSessionTypes) => {
        login(sessionKey)
    }

    const selectSession = (sessionKey: WhatsappSessionTypes) => async () => {
        if(!logged) await destroyWsClient(selectedSession);
        setSelectedSession(sessionKey)
        changeSession(sessionKey)
    }
    const handleSendMessage = (sessionId: WhatsappSessionTypes) => async () => {
        const whatsappUsers = getWhatsappUsers();
        sendMessage(sessionId, whatsappUsers, {text: message, photo})
    }

    const onChangeMessage = (e: any) => {
        const {value} = e.target;
        setMessage(value);
    }

    /* onSelectPhoto, select the photo to set it in order  we can send it*/
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


    const handleLabelSelection = (selectedList: IWsLabel[]) => {
        let labeled: IWsUser[] = [];
        selectedList.forEach(label => labeled = [...labeled, ...label.users]);
        setLabeledUsers(labeled);
    }


    const handleGroupSelection = (selectedList: IWsGroup[]) => {
        let grouped: IWsUser[] = [];
        selectedList.forEach(group => grouped = [...grouped, ...group.participants]);
        console.log("grouped", grouped);
        setGroupedUsers(grouped);
    }


    const handleUserExcluding = (isRemove: boolean) => (users: IWsUser[], currentUser: IWsUser) => {
        if(isRemove) {
            setExcludedWhatsappUsers(excludedWhatsappUsers.filter(item => item.number !== currentUser.number));
        } else {
            setExcludedWhatsappUsers([...excludedWhatsappUsers, currentUser]);
        }
    };

    const handleUserSelection = (isRemove: boolean) => (users: IWsUser[], currentUser: IWsUser) => {
        if(isRemove) {
            setSelectedWhatsappUsers(selectedWhatsappUsers.filter(item => item.number !== currentUser.number));
        } else {
            setSelectedWhatsappUsers([...selectedWhatsappUsers, currentUser]);
        }
    };

    const getWhatsappUsers = (): IWsUser[] => {
        const excluded: {[N in string]: boolean} = {};
        excludedWhatsappUsers.forEach(item => excluded[item.number] = true);

        const data = [...labeledUsers, ...groupedUsers, ...selectedWhatsappUsers].filter(user => {
            return !excluded[user.number]
        });

        return data;
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


            {!!logged && <>
              <Multiselect
                placeholder="Todos los Usuarios"
                className="mb-3"
                onSelect={handleUserSelection(false)}
                onRemove={handleUserSelection(true)}
                options={seedData.users} // Options to display in the dropdown
                displayValue="fullName" // Property name to display in the dropdown options
              />
              <DoubleSelectableWrapper className="mb-3">
                <Multiselect
                  placeholder="Todos los usuaruis de estos Grupos"
                  options={seedData.groups} // Options to display in the dropdown
                  displayValue="subject" // Property name to display in the dropdown options
                  onSelect={handleGroupSelection}
                  onRemove={handleGroupSelection}
                />
                <Multiselect
                  placeholder="Excepto estos usuarios"
                  onSelect={handleUserExcluding(false)}
                  onRemove={handleUserExcluding(true)}
                  options={groupedUsers} // Options to display in the dropdown
                  displayValue="fullName" // Property name to display in the dropdown options
                />
              </DoubleSelectableWrapper>
              <DoubleSelectableWrapper className="mb-3">
                <Multiselect
                  placeholder="Todas los usuarios de estas Etiquetas"
                  options={seedData.labels} // Options to display in the dropdown
                  displayValue="name" // Property name to display in the dropdown options
                  onSelect={handleLabelSelection}
                  onRemove={handleLabelSelection}
                />
                <Multiselect
                  placeholder="Excepto estos usuarios"
                  onSelect={handleUserExcluding(false)}
                  onRemove={handleUserExcluding(true)}
                  options={labeledUsers} // Options to display in the dropdown
                  displayValue="fullName" // Property name to display in the dropdown options
                />
              </DoubleSelectableWrapper>
            </>}

            {!logged ?
                <div>
                    <h3 className="text-center mb-3">Escanear con Whatsapp</h3>
                    {qrElement}
                </div>
                :
                <div>
                    <h3 className="text-center mb-3">Enviar Mensaje</h3>
                    <p className="mt-2">Puedes usar @firstName, @lastName, @fullName y @number para personalizar el
                        mensaje</p>
                    <textarea
                        className="mb-3 w-100"
                        onChange={onChangeMessage}
                        rows={10}
                    />
                    { !!photo &&
                      <ImageWrapper>
                        <img src={photo} alt=""/>
                    </ImageWrapper> }

                    <div className="mt-3 mb-5">
                        <label className="btn btn-outline-info w-100" htmlFor="file">
                            Cargar Archivo
                        </label>
                        <input
                            className="invisible"
                            onChange={onSelectPhoto}
                            type="file"
                            name="file"
                            id="file"
                            accept="image/png,image/jpg,image/gif,image/jpeg"
                        />
                    </div>
                    <Button className="float-right" color="success" outline
                            onClick={handleSendMessage(selectedSession)}>Send
                        Message</Button>
                </div>
            }
        </MessagingContainer>
    )
}

export default Messaging;
