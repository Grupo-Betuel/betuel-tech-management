import React, { useEffect } from "react";
import { ClientItem, TagList } from "..";
import { IClient } from "../../model/interfaces/ClientModel";
import {
    Spinner,
    Modal,
    ModalBody,
    Button,
    Input,
    Dropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem
} from "reactstrap";
import { toast } from "react-toastify";
import { addClient, deleteClient, getClients, updateClients } from "../../services/clients";
import "./ClientList.scss"
import { getTags } from "../../services/tags";
import { ITag } from "../../model/interfaces/TagModel";

export interface IClientList {
}

const ClientList: React.FC<IClientList> = () => {
    const [editableList, setEditableList] = React.useState<boolean[]>([false]);
    const [clients, setClients] = React.useState<IClient[]>([]);
    const [tempClients, setTempClients] = React.useState<IClient[]>([]);
    const [checkedClients, setCheckedClients] = React.useState<IClient[]>([]);
    const [deleteClientIsOpen, setDeleteClientIsOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [deleteId, setDeleteId] = React.useState<string>();
    const [tagDropdownIsOpen, setTagDropdownIsOpen] = React.useState<boolean[]>([]);
    const [allClients, setAllClients] = React.useState<IClient[]>([]);
    const [tags, setTags] = React.useState<ITag[]>([]);

    React.useEffect(() => {
        setClients(allClients || [])
        !checkedClients.length && setCheckedClients(allClients || [])
    }, [allClients])


    const loadClients = async () => {
        setLoading(true);
        try {
            const res = await getClients();
            setAllClients(res);
        } catch (error: any) {
            toast('Error mientras cargaba los clientes: ' + error.message, {type: 'error'})
        }
        setLoading(false);
    }

    useEffect(() => {
        loadClients();
    }, [])

    const toggleTagDropdown = (index: number) => () => {
        const tagsDropdown: boolean[] = [...tagDropdownIsOpen];

        tagsDropdown[index] = !tagsDropdown[index];
        setTagDropdownIsOpen([...tagsDropdown])
    }

    const onSearchClient = (e: any) => {
        const value = e.target.value ? e.target.value.toLowerCase() : '';
        setClients(allClients.filter((item: any) => !value || JSON.stringify(item).toLowerCase().includes(value)))
    }
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

    const loadTags = async (receivedTags: ITag[]) => {
        setTags(receivedTags);
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
        const response = await deleteClient(JSON.stringify({_id: deleteId}));
        if (response.status === 204) {
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
                if (temp._id) {
                    response = await updateClients(JSON.stringify(temp));
                } else {
                    response = await addClient(JSON.stringify(temp));
                }

                if (response.status === 201 || response.status === 200) {
                    clients[index] = response.status === 200 ? temp : (await response.json() as any);
                    console.log(clients[index], 'klk');
                    setClients([...clients]);
                    toast(`¡Cliente ${temp._id ? 'Actualizado' : 'Agregado'} Correctamente!`, {type: 'success'})
                } else {
                    console.log(response, 'error');
                    toast('error', {type: 'error'})
                }
            } else {
                toast('No puedes guardar un contacto sin numero', {type: 'error'});
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
        if (e.target.checked) {
            data[index] = client;
        } else {
            delete data[index];
        }
        setCheckedClients(() => [...data]);

    };

    const setTagToClient = (client: IClient, tag: ITag) => async (e: any) => {
        setLoading(true);
        e.preventDefault();
        let updatedTags = [];
        if(client.tags.indexOf(tag._id) !== -1) {
            updatedTags = client.tags.filter((tagId) => tagId !== tag._id);
        } else {
            updatedTags = [
                ...client.tags,
                tag,
            ]
        }

        const newClient = {
            ...client,
            tags: updatedTags,
        }
        const response = await updateClients(JSON.stringify(newClient));
        console.log(response, 'response');
        setLoading(false);
        loadClients();
    }

    const onSelectTag = (tags: ITag[]) => {
        let newClients = allClients;
        if(tags.length) {
            newClients = allClients.filter((clientItem, index) => {
                // if the client has one or more from the selectedTags
                const passed = !!clientItem.tags.find(tagId => tags.find(tagItem => tagItem._id === tagId));
                if(passed) {
                    onCheckClient(clientItem, index)({ target: { checked: true }});
                }
                return passed
            });
        }

        setClients([...newClients]);

    }
    return (
        <>
            <Input type="text" onChange={onSearchClient} placeholder="Buscar Client" className="mb-3"/>
            <TagList onUpdateTags={loadTags} onSelectTag={onSelectTag}/>
            <div className="client-list-container">
                {
                    !loading ? null :
                        <>
                            <div className="loading-sale-container">
                                <Spinner animation="grow" variant="secondary"/>
                            </div>
                        </>
                }
                {clients.length ? clients.map((client, index) => (
                    <div className="d-flex align-items-center w-100 mb-3 px-4" key={index}>
                        {editableList[index] ?
                            <i className="bi bi-dash-circle-fill cursor-pointer text-danger me-3"
                               onClick={handleDeleteClient(client, index)}/>
                            : <input
                                className="client-checkbox me-3"
                                type="checkbox"
                                checked={!!checkedClients[index]}
                                onChange={onCheckClient(client, index)}
                                style={{
                                    transform: 'scale(1.2)',
                                }}
                            />}
                        <ClientItem client={{...client, ...(tempClients[index] ? tempClients[index] : {})}}
                                    editable={editableList[index]} onChange={onChangeClient(index)}/>
                        <div className="d-flex align-items-center ms-3">
                            {!editableList[index] ?
                                <>
                                    <i className="bi bi-pencil cursor-pointer text-info"
                                       onClick={toggleEditable(index)}/>
                                    {index === clients.length - 1 &&
                                      <i className=" ms-3 bi bi-plus-lg cursor-pointer text-success"
                                         onClick={pushClient}/>
                                    }
                                </>
                                :
                                <>
                                    <i className="bi bi-check-lg cursor-pointer me-4 text-success font-weight-bold"
                                       onClick={saveClient(index)}/>
                                    <i className="bi bi-x-lg cursor-pointer text-danger font-weight-bold me-4"
                                       onClick={handleRemoveClient(index)}/>
                                    <Dropdown toggle={toggleTagDropdown(index)} isOpen={tagDropdownIsOpen[index]}>
                                        <DropdownToggle tag="span" outline>
                                            <i className="bi bi-chevron-down cursor-pointer text-info font-weight-bold"/>
                                        </DropdownToggle>
                                        <DropdownMenu>
                                            <DropdownItem toggle={false} header>
                                                Select Tags
                                            </DropdownItem>
                                            {tags.length ? tags.map((tag: ITag, index: number) =>
                                                    <DropdownItem toggle={false}
                                                                  active={!!client.tags.find(tagI => tagI === tag._id)}
                                                                  key={index}
                                                                  onClick={setTagToClient(client, tag)}>
                                                        {tag.title}
                                                    </DropdownItem>
                                                )
                                                : <DropdownItem active>
                                                    No se encontraron tags
                                                </DropdownItem>}
                                        </DropdownMenu>
                                    </Dropdown>
                                </>
                            }
                        </div>
                    </div>

                )) : <p>No se encontraron clientes...</p>}

                <Modal isOpen={deleteClientIsOpen} toggle={toggleDeleteClient}>
                    <ModalBody>
                        <h4 className="text-center">¿Seguro que quieres eliminar este cliente?</h4>
                        <div className="mt-4 d-flex align-items-center justify-content-center">
                            <Button color="info" onClick={toggleDeleteClient} className="me-4"
                                    outline>Cancel</Button>{' '}
                            <Button color="danger" outline onClick={acceptDeleteClient}>Eliminar</Button>
                        </div>
                    </ModalBody>
                </Modal>

            </div>
        </>
    )
}

export default ClientList;
