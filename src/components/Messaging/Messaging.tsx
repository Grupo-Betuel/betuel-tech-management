import {IClient} from "../../model/interfaces/ClientModel";
import React, {ChangeEvent, useState} from "react";
import styled from "styled-components";
import {
    Button,
    FormGroup,
    Input,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Spinner,
    Tooltip
} from "reactstrap";
import InputMask from "react-input-mask";
import {toast} from "react-toastify";
import useWhatsapp, {whatsappSeedStorePrefix} from "../hooks/UseWhatsapp";
import {TagContainer, TagItem} from "../Tag/Tag";
import {
    IWsGroup,
    IWsLabel, IWsUser,
    whatsappSessionKeys,
    whatsappSessionList,
    whatsappSessionNames,
    WhatsappSessionTypes
} from "../../model/interfaces/WhatsappModels";
import {Multiselect} from "multiselect-react-dropdown";
import {IProductData} from "../../model/products";
import {Product} from "../index";
import "./Messaging.scss";

export interface IMessaging {
    contacts: IClient[],
    selectedProducts: IProductData[];
    setSelectedProducts: (products: IProductData[]) => any;
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

export type SessionActionsTypes = 'restart' | 'close' | 'fetchSeedData';

const Messaging: React.FC<IMessaging> = (
    {
        contacts,
        selectedProducts,
        setSelectedProducts,
    }
) => {
    const [selectedSession, setSelectedSession] = useState<WhatsappSessionTypes>(whatsappSessionKeys.wpadilla)
    const [message, setMessage] = useState<string>('')
    const [onlySendImagesIds, setOnlySendImagesIds] = useState<string[]>([]);
    const [photo, setPhoto] = useState<any>()
    const [labeledUsers, setLabeledUsers] = React.useState<IWsUser[]>([]);
    const [groupedUsers, setGroupedUsers] = React.useState<IWsUser[]>([]);
    const [excludedWhatsappUsers, setExcludedWhatsappUsers] = React.useState<IWsUser[]>([]);
    const [selectedWhatsappUsers, setSelectedWhatsappUsers] = React.useState<IWsUser[]>([]);
    const lastSession = React.useRef<WhatsappSessionTypes>();
    const [actionToConfirm, setActionToConfirm] = React.useState<SessionActionsTypes | undefined>(undefined);

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
        updateSeedDataWithLocalStorage,
        fetchWsSeedData,
        restartWhatsapp
    } = useWhatsapp(selectedSession);


    React.useEffect(() => {
        // return (session = selectedSession) => {
        //     if(!logged) {
        //         !!lastSession.current && destroyWsClient(lastSession.current)
        //     }
        // }
    }, []);

    // React.useEffect(() => {
    //     if(logged) {
    //         fetchWsSeedData(selectedSession)
    //     }
    // }, [logged]);

    const handleSendOnlyImage = (id: string) => () => {
        if (onlySendImagesIds.indexOf(id) !== -1) {
            setOnlySendImagesIds(onlySendImagesIds.filter((imageId: string) => imageId !== id))
            return;
        } else {
            setOnlySendImagesIds([...onlySendImagesIds, id])
        }
    };

    const removeSelection = (id: string) => () => {
        setSelectedProducts(selectedProducts.filter((product: IProductData) => product._id !== id))
    }

    const onMessageSent = (contact: IClient) => {
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
        // if(!logged) await destroyWsClient(selectedSession);
        setSelectedSession(sessionKey)
        changeSession(sessionKey)
        updateSeedDataWithLocalStorage(sessionKey);
    }

    const parseUrlToBase64 = (url: string, callback: (base64: Blob) => void) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
            const reader = new FileReader();
            reader.onloadend = function () {
                callback((reader as any).result);
            }
            reader.readAsDataURL(xhr.response);
        };
        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.send();
    }

    const handleSendMessage = (sessionId: WhatsappSessionTypes) => async () => {
        const whatsappUsers = getWhatsappUsers();

        if (selectedProducts && selectedProducts.length) {
            await Promise.all(selectedProducts.map(async product => {
                const prefixText = message ? `${message} \n` : '';
                let text = `${prefixText}${product.description || ''}`;

                if(onlySendImagesIds.indexOf(product._id) !== -1) {
                    text = message;
                }

                parseUrlToBase64(product.image, async (image: Blob) => {
                    await sendMessage(sessionId, whatsappUsers, {text, photo: image})
                });
            }));
        } else {
            sendMessage(sessionId, whatsappUsers, {text: message, photo})
        }
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
        setGroupedUsers(grouped);
    }


    const handleUserExcluding = (isRemove: boolean) => (users: IWsUser[], currentUser: IWsUser) => {
        if (isRemove) {
            setExcludedWhatsappUsers(excludedWhatsappUsers.filter(item => item.phone !== currentUser.phone));
        } else {
            setExcludedWhatsappUsers([...excludedWhatsappUsers, currentUser]);
        }
    };

    const handleUserSelection = (isRemove: boolean) => (users: IWsUser[], currentUser: IWsUser) => {
        if (isRemove) {
            setSelectedWhatsappUsers(selectedWhatsappUsers.filter(item => item.phone !== currentUser.phone));
        } else {
            setSelectedWhatsappUsers([...selectedWhatsappUsers, currentUser]);
        }
    };

    const getWhatsappUsers = (): IWsUser[] => {
        const excluded: { [N in string]: boolean } = {};
        excludedWhatsappUsers.forEach(item => excluded[item.phone] = true);

        const data = [...labeledUsers, ...groupedUsers, ...selectedWhatsappUsers].filter(user => {
            return !excluded[user.phone]
        });

        return data;
    }

    const onChangeCustomContact = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {

    }

    const handleSessionAction = async () => {
        if(actionToConfirm === 'restart') {
            await restartWhatsapp(selectedSession);
        } else if(actionToConfirm === 'close') {
            await logOut(selectedSession)
        } else if(actionToConfirm === 'fetchSeedData') {
            await fetchWsSeedData(selectedSession);
        }
        setActionToConfirm(undefined);

    }

    const handleActionToConfirm = (value?: SessionActionsTypes) => () => {
        setActionToConfirm(value);
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
            <LogOutButton
                title="Cerrar Sesión"
                className="bi bi-power text-danger log-out-icon cursor-pointer"
                onClick={handleActionToConfirm('close')}/>
            {
                loading ?
                    (
                        <div className="loading-sale-container">
                            <Spinner animation="grow" variant="secondary"/>
                        </div>
                    ) : null
            }

            <div className="messaging-actions">
                <Button onClick={handleActionToConfirm('fetchSeedData')} color="info" outline>Recargar Contactos</Button>
                <Button onClick={handleActionToConfirm('restart')} color="warning" outline>Reiniciar Sesion</Button>
            </div>
            {!!logged && <>
                <InputMask className="form-control mb-3" placeholder="Numeros de whatsapp" onChange={onChangeCustomContact} mask="+1 (999) 999-9999,+1 (999) 999-9999,+1 (999) 999-9999,+1 (999) 999-9999,+1 (999) 999-9999,+1 (999) 999-9999," />
                <Multiselect
                    placeholder="Todos los Usuarios"
                    className="mb-3"
                    onSelect={handleUserSelection(false)}
                    onRemove={handleUserSelection(true)}
                    options={seedData.users || []} // Options to display in the dropdown
                    displayValue="fullName" // Property name to display in the dropdown options
                />
                <DoubleSelectableWrapper className="mb-3">
                    <Multiselect
                        placeholder="Grupos"
                        options={seedData.groups || []} // Options to 2display in the dropdown
                        displayValue="subject" // Property name to display in the dropdown options
                        onSelect={handleGroupSelection}
                        onRemove={handleGroupSelection}
                    />
                    <Multiselect
                        placeholder="Excepto estos usuarios"
                        onSelect={handleUserExcluding(false)}
                        onRemove={handleUserExcluding(true)}
                        options={groupedUsers || []} // Options to display in the dropdown
                        displayValue="fullName" // Property name to display in the dropdown options
                    />
                </DoubleSelectableWrapper>
                <DoubleSelectableWrapper className="mb-3">
                    <Multiselect
                        placeholder="Etiquetas"
                        options={seedData.labels && seedData.labels.map(item => ({
                            ...item,
                            name: item.name || "example",
                            id: Number(item.id)
                        })) || []} // Options to display in the dropdown
                        displayValue="name" // Property name to display in the dropdown options
                        onSelect={handleLabelSelection}
                        onRemove={handleLabelSelection}
                        isObject={true}
                    />
                    <Multiselect
                        placeholder="Excepto estos usuarios"
                        onSelect={handleUserExcluding(false)}
                        onRemove={handleUserExcluding(true)}
                        options={labeledUsers || []} // Options to display in the dropdown
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
                    <h3 className="text-center mb-3">Enviar {selectedProducts && selectedProducts.length ? 'Productos' : 'Mensaje'}</h3>
                    {!!(selectedProducts && selectedProducts.length) &&
                        <div className="products-wrapper">
                            {selectedProducts.map((item, i) => (
                                <div className="product-container">
                                    <Product
                                        {...item}
                                        enableSelection={false}
                                        onRemoveProduct={removeSelection(item._id)}
                                        key={i}
                                    />
                                    <FormGroup className="d-flex flex-column align-items-center" switch>
                                        <Input
                                            type="switch" role="switch"
                                            checked={onlySendImagesIds.indexOf(item._id) !== -1}
                                            onChange={handleSendOnlyImage(item._id)}/>
                                    </FormGroup>

                                </div>
                            ))}
                        </div>}
                    <p className="mt-2">Puedes usar @firstName, @lastName, @fullName y @number para personalizar el
                        mensaje</p>
                    <textarea
                        className="mb-3 w-100"
                        onChange={onChangeMessage}
                        rows={10}
                    />
                    {!!photo &&
                        <ImageWrapper>
                            <img src={photo} alt=""/>
                        </ImageWrapper>}

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
            <Modal isOpen={!!actionToConfirm} toggle={handleActionToConfirm()}>
                <ModalHeader toggle={handleActionToConfirm()}>Confirmación</ModalHeader>
                <ModalBody>
                    ¿Estas Seguro que deseas realizar esta acción?
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={handleSessionAction}>Confirmar</Button>{' '}
                    <Button color="secondary" onClick={handleActionToConfirm()}>Cancel</Button>
                </ModalFooter>
            </Modal>
        </MessagingContainer>
    )
}

export default Messaging;
