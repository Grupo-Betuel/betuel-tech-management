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

import React, {useMemo, useState} from "react";
import {toast} from "react-toastify";
import "./ClientMng.scss";
import {clientStageList, IClient} from "../../../../models/interfaces/ClientModel";

export interface IClientsMngProps {
    clients: IClient[];
    originalClients: IClient[];
    addNewClient: (messenger: IClient) => Promise<void>;
    updateClientList: (messengers: IClient[]) => void;
    updateClient: (messenger: IClient) => Promise<void>;
    onDeleteClient: (messenger: IClient) => void;
}

export const ClientMng = ({
                              updateClient,
                              originalClients,
                              clients,
                              addNewClient,
                              updateClientList,
                              onDeleteClient
                          }: IClientsMngProps) => {
    const [clientToCreate, setClientToCreate] = useState<IClient>({} as IClient);
    const onChangeClientToCreate = ({target: {name, value}}: React.ChangeEvent<HTMLInputElement>) => {
        setClientToCreate({
            ...clientToCreate,
            [name]: value
        })
    }
    const validClient = (messenger: IClient) => {
        const {firstName, lastName, phone} = messenger
        const res = (!!firstName && !!lastName && !!phone)
        if (!res) {
            toast("Todos los campos son requeridos")
        }
        return res
    }
    const handleNewClient = async () => {
        if (validClient(clientToCreate)) {

            await addNewClient(clientToCreate);
            setClientToCreate({} as any);
        } else {
            toast('Invalid Client Data')
        }
    }


    const hostname: string = useMemo(() => window.location.origin, [window.location.origin])
    const handleUpdateClient = (messenger: IClient) => async () => {
        await updateClient(messenger)
    }

    const hasClientChanged = (messenger: IClient) => {
        const originalClient = originalClients.find((m) => m._id === messenger._id);
        return JSON.stringify(messenger) !== JSON.stringify(originalClient);
    }

    const handleDeleteClient = (messenger: IClient) => () => {
        onDeleteClient && onDeleteClient(messenger)
    }

    const onChangeClient = (client: IClient) => ({target: {name, value, type}}: React.ChangeEvent<HTMLInputElement>) => {
        if(type === 'tel') {
            if(!Number(value)) return
        }
        const newClients = clients.map((c) => {
            if (c._id === client._id) {
                return {...c, [name]: value} as IClient
            }
            return c as IClient;
        })
        updateClientList(newClients)
    }

    return (
        <div className="clients-mng-grid">
            <Card>
                <CardBody>
                    <Form>
                        {/*firstName: string*/}
                        {/*lastName: string*/}
                        {/*phone: string*/}
                        <FormGroup>
                            <Label><b>Nombre</b></Label> <br/>
                            <Input value={clientToCreate.firstName || ''} name="firstName"
                                   onChange={onChangeClientToCreate}/>
                        </FormGroup>
                        <FormGroup>
                            <Label><b>Apellido</b></Label> <br/>
                            <Input value={clientToCreate.lastName || ''} name="lastName"
                                   onChange={onChangeClientToCreate}/>
                        </FormGroup>
                        <FormGroup className="client-item">
                            <Label for="stage">Etapa:</Label>
                            <Input
                                onChange={onChangeClientToCreate}
                                type="select"
                                name="stage"
                                id="stage"
                                value={clientToCreate.stage}
                            >
                                {clientStageList.map(stage => <option value={stage} key={stage}>{stage}</option>)}
                            </Input>
                        </FormGroup>
                        <FormGroup>
                            <Label><b>Whatsapp:</b></Label> <br/>
                            <Input minLength={10} maxLength={11}
                                   value={clientToCreate.phone || ''}
                                   type='tel'
                                   name="phone"
                                   onChange={onChangeClientToCreate}/>
                        </FormGroup>
                        <FormGroup>
                            <Label><b>Instagram</b></Label> <br/>
                            <Input value={clientToCreate.instagram || ''}
                                   name="instagram"
                                   onChange={onChangeClientToCreate}/>
                        </FormGroup>
                    </Form>
                </CardBody>
                <CardFooter>

                    <Button color="success" onClick={handleNewClient}>Crear Cliente</Button>
                </CardFooter>
            </Card>
            {clients.map((client) => (
                <Card
                    key={client._id}
                    // color={messengerStatusCardColor[client.status]}
                    // outline={client.fromSocket}
                >
                    <CardBody>
                        <CardText>
                            <a href={`https://wa.me/${client.phone}`}
                               target="_blank">Contactar via WS</a>
                        </CardText>
                        <CardText>
                            {client.from}
                        </CardText>
                    </CardBody>
                    <ListGroup flush>
                        <ListGroupItem className="d-flex gap-2 align-items-center">
                            <b className="text-nowrap">Nombre: </b>
                            <Input value={client.firstName}
                                   onChange={onChangeClient(client)}
                                   name="firstName"/>
                        </ListGroupItem>
                        <ListGroupItem className="d-flex gap-2 align-items-center">
                            <b className="text-nowrap">Apellido: </b>
                            <Input value={client.lastName}
                                   onChange={onChangeClient(client)}
                                   name="lastName"/>
                        </ListGroupItem>

                        <ListGroupItem>
                            <Label for="stage1"><b className="text-nowrap">Etapa:</b></Label>
                            <Input
                                onChange={onChangeClient(client)}
                                type="select"
                                name="stage"
                                id="stage1"
                                value={client.stage}
                            >
                                {clientStageList.map(stage => <option value={stage} key={stage}>{stage}</option>)}
                            </Input>
                        </ListGroupItem>
                        <ListGroupItem className="d-flex gap-2 align-items-center">
                            <b className="text-nowrap">Whatsapp: </b>
                            <Input value={client.phone}
                                   maxLength={11}
                                   minLength={11}
                                   type="tel"
                                   onChange={onChangeClient(client)}
                                   name="phone"/>
                        </ListGroupItem>
                        <ListGroupItem className="d-flex gap-2 align-items-center">
                            <b className="text-nowrap">Instagram: </b>
                            <Input value={client.instagram}
                                   onChange={onChangeClient(client)}
                                   name="instagram"/>
                        </ListGroupItem>
                    </ListGroup>
                    <CardBody className="d-flex justify-content-between flex-wrap gap-2">
                        <Button color="danger" className="text-nowrap align-self-start"
                                onClick={handleDeleteClient(client)}>
                            Eliminar
                        </Button>
                        {hasClientChanged(client) &&
                            <Button color="primary" className="text-nowrap w-100 align-self-start"
                                    onClick={handleUpdateClient(client)}>
                                Guardar Cambios
                            </Button>}
                    </CardBody>
                </Card>))}
        </div>
    )
}