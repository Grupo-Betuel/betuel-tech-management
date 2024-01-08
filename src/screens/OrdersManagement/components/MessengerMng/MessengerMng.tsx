import {
    Button,
    Card,
    CardBody,
    CardFooter,
    CardText, Form,
    FormGroup,
    Input,
    Label,
    ListGroup,
    ListGroupItem
} from "reactstrap";
import {IMessenger, messengerStatusList} from "../../../../model/messengerModels";
import React, {useMemo, useState} from "react";
import {messengerStatusCardColor} from "../../OrdersManagement";
import {toast} from "react-toastify";
import "./MessengerMng.scss";
export interface IMessengersMngProps {
    messengers: IMessenger[];
    originalMessengers: IMessenger[];
    addNewMessenger: (messenger: IMessenger) => Promise<void>;
    updateMessengerList: (messengers: IMessenger[]) => void;
    updateMessenger: (messenger: IMessenger) => Promise<void>;
    onDeleteMessenger: (messenger: IMessenger) => void;
}
export const MessengerMng = ({ updateMessenger, originalMessengers, messengers, addNewMessenger, updateMessengerList, onDeleteMessenger }: IMessengersMngProps) => {
    const [messengerToCreate, setMessengerToCreate] = useState<IMessenger>({} as IMessenger);
    const onChangeMessengerToCreate = ({target: {name, value}}: React.ChangeEvent<HTMLInputElement>) => {
        setMessengerToCreate({
            ...messengerToCreate,
            [name]: value
        })
    }
    const validMessenger = (messenger: IMessenger) => {
        const {firstName, lastName, phone} = messenger
        const res = (!!firstName && !!lastName && !!phone)
        if (!res) {
            toast("Todos los campos son requeridos")
        }
        return res
    }
    const handleNewMessenger = async () => {
        if (validMessenger(messengerToCreate)) {

            await addNewMessenger(messengerToCreate);
            setMessengerToCreate({} as any);
        } else {
            toast('Invalid Messenger Data')
        }
    }

    const changeMessengerStatus = (messenger: IMessenger) => ({target: {value}}: React.ChangeEvent<HTMLInputElement>) => {
        const newMessengers = messengers.map((m) => {
            if (m._id === messenger._id) {
                return {...m, status: value} as IMessenger
            }
            return m as IMessenger;
        })
        updateMessengerList(newMessengers)
    }

    const hostname: string = useMemo(() => window.location.origin, [window.location.origin])
    const handleUpdateMessenger =  (messenger: IMessenger) => async () => {
        await updateMessenger(messenger)
    }

    const hasMessengerChanged = (messenger: IMessenger) => {
        const originalMessenger = originalMessengers.find((m) => m._id === messenger._id);
        return JSON.stringify(messenger) !== JSON.stringify(originalMessenger);
    }

    const handleDeleteMessenger = (messenger: IMessenger)=> () => {
        onDeleteMessenger && onDeleteMessenger(messenger)
    }

    return (
        <div className="messenger-mng-grid">
            <Card>
                <CardBody>
                    <Form>
                        {/*firstName: string*/}
                        {/*lastName: string*/}
                        {/*phone: string*/}
                        <FormGroup>
                            <Label><b>Nombre</b></Label> <br/>
                            <Input value={messengerToCreate.firstName} name="firstName"
                                   onChange={onChangeMessengerToCreate}/>
                        </FormGroup>
                        <FormGroup>
                            <Label><b>Apellido</b></Label> <br/>
                            <Input value={messengerToCreate.lastName} name="lastName"
                                   onChange={onChangeMessengerToCreate}/>
                        </FormGroup>
                        <FormGroup>
                            <Label><b>Telefono (Whatsapp)</b></Label> <br/>
                            <Input minLength={10} maxLength={11} value={messengerToCreate.phone}
                                   name="phone"
                                   onChange={onChangeMessengerToCreate}/>
                        </FormGroup>
                    </Form>
                </CardBody>
                <CardFooter>

                    <Button color="success" onClick={handleNewMessenger}>Crear Mensajero</Button>
                </CardFooter>
            </Card>
        {messengers.map((messenger) => (
                <Card
                    key={messenger._id}
                    color={messengerStatusCardColor[messenger.status]}
                    outline={messenger.fromSocket}
                >
                    <CardBody>
                        <CardText>
                            <b>{messenger.firstName} {messenger.lastName}</b>
                        </CardText>
                    </CardBody>
                    <ListGroup flush>
                        <ListGroupItem>
                            <b>Whatsapp</b>: <a href={`https://wa.me/${messenger.phone}`}
                                                target="_blank">{messenger.phone}</a>
                        </ListGroupItem>
                        <ListGroupItem className="d-flex gap-2 align-items-center">
                            <b>Estado:</b> <Input placeholder="Estado"
                                                  onChange={changeMessengerStatus(messenger)}
                                                  value={messenger.status}
                                                  type="select">
                            {messengerStatusList.map((type: string) =>
                                <option value={type} key={type}>{type}</option>)
                            }
                        </Input>

                        </ListGroupItem>

                        <ListGroupItem className="d-flex align-items-center justify-content-between gap-3">
                            <b>Cotizando orden:</b> <a className="text-break"
                                                       href={`${hostname}/order-detail/${messenger.quotingOrder}`}
                                                       target="_blank">{messenger.quotingOrder}</a>
                            {messenger.quotingOrder &&
                                <i className="bi bi-trash remove-button"
                                   onClick={handleUpdateMessenger({...messenger, quotingOrder: null})}/>}
                        </ListGroupItem>
                        <ListGroupItem>
                            <b>Ordenes asignadas:</b>
                            <div className="d-flex flex-column gap-2 align-items-start w-100">

                                {
                                    messenger
                                        .currentOrders?.map(id =>
                                        <div key={`current-order-${id}`}
                                             className="d-flex align-items-center justify-content-between gap-3 w-100">
                                            <a href={`${hostname}/order-detail/${id}`}
                                               target="_blank">{id}</a>

                                            <i className="bi bi-trash remove-button"
                                               onClick={handleUpdateMessenger({
                                                   ...messenger,
                                                   currentOrders: messenger.currentOrders?.filter(orderId => orderId !== id)
                                               })
                                               }
                                            />
                                        </div>
                                    )
                                }
                            </div>
                        </ListGroupItem>
                        <ListGroupItem>
                            <b>Pendiente en tienda</b>: RD${(messenger.pendingMoney || 0)?.toLocaleString()}
                        </ListGroupItem>
                        <ListGroupItem>
                            <b>Pendiente para el mensajero</b>: RD${(messenger.pendingPayment || 0)?.toLocaleString()}
                        </ListGroupItem>
                    </ListGroup>
                    <CardBody className="d-flex justify-content-between flex-wrap gap-2">
                        <Button color="danger" className="text-nowrap align-self-start"
                                onClick={handleDeleteMessenger(messenger)}>
                            Eliminar
                        </Button>
                        {hasMessengerChanged(messenger) &&
                            <Button color="primary" className="text-nowrap w-100 align-self-start"
                                    onClick={handleUpdateMessenger(messenger)}>
                                Guardar Cambios
                            </Button>}
                    </CardBody>
                </Card>))}
        </div>
    )
}