import React from "react";
import { ClientItem } from "..";
import { IClient } from "../../model/interfaces/ClientModel";
import { Pagination, Spinner, Modal, ModalBody, ModalFooter, Button, Input } from "reactstrap";
import { toast } from "react-toastify";
import { addClient, deleteClient, updateClients } from "../../services/clients";

export interface IClientList {
    clientList: IClient[];
}

const ClientList: React.FC<IClientList> = (
    {
        clientList,
    }
) => {
    const [editableList, setEditableList] = React.useState<boolean[]>([false]);
    const [clients, setClients] = React.useState<IClient[]>([]);
    const [tempClients, setTempClients] = React.useState<IClient[]>([]);
    const [checkedClients, setCheckedClients] = React.useState<IClient[]>([]);
    const [deleteClientIsOpen, setDeleteClientIsOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [deleteId, setDeleteId] = React.useState();

    React.useEffect(() => {
        setClients(clientList || [])
        setCheckedClients(clientList || [])
    }, [clientList])

    const toggleEditable = (index: number) => () => {
        editableList[index] = !editableList[index];
        setEditableList([...editableList]);
        setTempClients([]);
    }

    const handleRemoveClient = (index: number) => () => {
        if (clients[index] && clients[index].number) {
            toggleEditable(index)()
        } else {
            removeClientFromList(index)
        }
    }

    const pushClient = async () => {
        await setClients(() => [
            ...clients,
            {} as IClient,
        ]);
        editableList[clients.length] = true;
        setEditableList([...editableList]);
    }

    const handleDeleteClient = (client: IClient, index: number) => () => {
        if (client && client._id) {
            setDeleteId(client._id)
            toggleDeleteClient();
        } else {
            removeClientFromList(index);
        }
    }

    const toggleDeleteClient = () => {
        setDeleteClientIsOpen(!deleteClientIsOpen)
    }

    const removeClientFromList = (index: number) => {
        const data = clients.filter((item, i) => i !== index)
        setClients([...data]);
    }

    const acceptDeleteClient = async () => {
        setLoading(true);
        toggleDeleteClient();
        const index = clients.indexOf(clients.find(item => item._id === deleteId) || {} as any)
        const response = await deleteClient(JSON.stringify({ _id: deleteId }));
        if(response.status === 204) {
            removeClientFromList(index)
        } else {
            toast('Error mientras eliminaba', {type: 'error'})
        }
        setLoading(false);

    }

    const saveClient = (index: number) => async () => {
        setLoading(true);
        const temp = tempClients[index];
        if (temp) {
            if (temp.number) {
                let response;
                if(temp._id) {
                    response = await updateClients(JSON.stringify(temp));
                } else {
                    response = await addClient(JSON.stringify(temp));
                }

                if(response.status === 201 || response.status === 200) {
                    clients[index] = response.status === 200 ? temp : (await response.json() as any);
                    console.log(clients[index], 'klk');
                    setClients([...clients]);
                    toast(`¡Cliente ${temp._id ? 'Actualizado' : 'Agregado'} Correctamente!`, {type: 'success'})
                } else {
                    console.log(response, 'error');
                    toast('error', {type: 'error'})
                }
            } else {
                toast('No puedes guardar un contacto sin numero', { type: 'error' });
            }
        }
        toggleEditable(index)();
        setLoading(false);

    }

    const onChangeClient = (index: number) => (client: IClient) => {
        tempClients[index] = client;
        setTempClients([...tempClients]);
    }

    const onCheckClient = (client: IClient, index: number) => (e: any) => {
        let data = [...checkedClients];
        if(e.target.checked) {
            data[index] = client;
        } else {
            delete data[index];
        }
        setCheckedClients(() => [...data]);

    };


    return (
        <div className="client-list-container">
            {
                !loading ? null :
                    <>
                        <div className="loading-sale-container">
                            <Spinner animation="grow" variant="secondary"/>
                        </div>
                    </>
            }
            {clients.length && clients.map((client, index) => (
                <div className="d-flex align-items-center w-100 mb-3">
                    { editableList[index] ?
                        <i className="bi bi-dash-circle-fill cursor-pointer text-danger mr-3" onClick={handleDeleteClient(client, index)} />
                        : <input
                        className="client-checkbox mr-3"
                        type="checkbox"
                        checked={!!checkedClients[index]}
                        onChange={onCheckClient(client, index)}
                        style={{
                            transform: 'scale(1.2)',
                        }}
                    />}
                    <ClientItem client={{...client, ...(tempClients[index] ? tempClients[index] : {})}}
                                editable={editableList[index]} onChange={onChangeClient(index)}/>
                    <div className="d-flex align-items-center ml-3">
                        {!editableList[index] ?
                            <>
                                <i className="bi bi-pencil cursor-pointer text-info" onClick={toggleEditable(index)}/>
                                {index === clients.length - 1 &&
                                  <i className=" ml-3 bi bi-plus-lg cursor-pointer text-success" onClick={pushClient}/>
                                }
                            </>
                            :
                            <>
                                <i className="bi bi-check-lg cursor-pointer mr-4 text-success font-weight-bold"
                                   onClick={saveClient(index)}/>
                                <i className="bi bi-x-lg cursor-pointer text-danger font-weight-bold"
                                   onClick={handleRemoveClient(index)}/>
                            </>
                        }
                    </div>
                </div>

            ))}

            <Modal isOpen={deleteClientIsOpen} toggle={toggleDeleteClient}>
                <ModalBody>
                    <h4 className="text-center">¿Seguro que quieres eliminar este cliente?</h4>
                    <div className="mt-4 d-flex align-items-center justify-content-center">
                        <Button color="info" onClick={toggleDeleteClient} className="mr-4" outline>Cancel</Button>{' '}
                        <Button color="danger" outline onClick={acceptDeleteClient}>Eliminar</Button>
                    </div>
                </ModalBody>
            </Modal>

        </div>

    )
}

export default ClientList;
