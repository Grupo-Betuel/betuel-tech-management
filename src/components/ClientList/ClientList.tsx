import React, { useCallback, useEffect, useRef } from "react";
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
import { addClient, addTagsToClients, deleteClient, getClients, updateClients } from "../../services/clients";
import "./ClientList.scss"
import { ITag } from "../../model/interfaces/TagModel";

export interface IClientList {
    onSelectClient?: (data: IClient[]) => any;
}

const ClientList: React.FC<IClientList> = ({onSelectClient}) => {
    const [editableList, setEditableList] = React.useState<IClient[]>([]);
    const [clients, setClients] = React.useState<IClient[]>([]);
    const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
    const [tempClients, setTempClients] = React.useState<IClient[]>([]);
    const [checkedClients, setCheckedClients] = React.useState<IClient[]>([] as IClient[]);
    const [deleteClientIsOpen, setDeleteClientIsOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [deleteId, setDeleteId] = React.useState<string>();
    const [tagDropdownIsOpen, setTagDropdownIsOpen] = React.useState<boolean[]>([]);
    const [allClients, setAllClients] = React.useState<IClient[]>([]);
    const [tags, setTags] = React.useState<ITag[]>([]);
    const [clientPage, setClientPage] = React.useState(1);
    const clientWrapper = useRef(null);


    React.useEffect(() => {
        setClients(allClients || [])
        // !checkedClients.length && setCheckedClients(allClients || [])
    }, [allClients])


    React.useEffect(() => {
        loadClients()
    }, [clientPage])

    const handleObserver = useCallback((entries: any) => {
        const target = entries[0];
        if (target.isIntersecting) {
            setClientPage((prev) => prev + 1);
        }
    }, []);

    useEffect(() => {
        const option = {
            root: null,
            rootMargin: "20px",
            threshold: 0
        };
        const observer = new IntersectionObserver(handleObserver, option);
        if (clientWrapper.current) observer.observe(clientWrapper.current);
    }, [handleObserver]);


    const loadClients = async () => {
        setLoading(true);
        try {
            const res = await getClients(clientPage);
            setAllClients(res);
        } catch (error: any) {
            toast('Error mientras cargaba los clientes: ' + error.message, {type: 'error'})
        }
        setLoading(false);
    }

    const toggleTagDropdown = (index: number) => () => {
        const tagsDropdown: boolean[] = [...tagDropdownIsOpen];

        tagsDropdown[index] = !tagsDropdown[index];
        setTagDropdownIsOpen([...tagsDropdown])
    }

    const onSearchClient = (e: any) => {
        const value = e.target.value ? e.target.value.toLowerCase() : '';
        setClients(allClients.filter((item: any) => !value || JSON.stringify(item).toLowerCase().includes(value)))
    }
    const toggleEditable = (client: IClient) => () => {
        let data = editableList;
        if (data.find(item => client._id === item._id)) {
            data = data.filter(item => client._id !== item._id);
        } else {
            data.push(client)
        }

        setEditableList(() => [...data]);
        // setTempClients([]);
    }

    const handleRemoveClient = (client: IClient) => () => {
        if (client && client.number) {
            toggleEditable(client)()
        } else {
            removeClientFromList(client)
        }
    }

    const pushClient = async () => {
        await setClients([
            {} as IClient,
            ...clients,
        ]);
        await setEditableList([
            {} as IClient,
            ...editableList,
        ]);
        setTempClients([
            {} as IClient,
            ...tempClients,
        ])
    }

    const loadTags = async (receivedTags: ITag[]) => {
        setTags(receivedTags);
    }

    const handleDeleteClient = (client: IClient) => () => {
        if (client && client._id) {
            setDeleteId(client._id)
            toggleDeleteClient();
        } else {
            removeClientFromList(client);
        }
    }

    const toggleDeleteClient = () => {
        setDeleteClientIsOpen(!deleteClientIsOpen)
    }

    const removeClientFromList = (client: IClient) => {
        const data = clients.filter((item) => item._id !== client._id)
        setClients([...data]);
    }


    const acceptDeleteClient = async () => {
        setLoading(true);
        toggleDeleteClient();
        const client = clients.find(item => item._id === deleteId) || {} as IClient
        const response = await deleteClient(JSON.stringify({_id: deleteId}));
        if (response.status === 204) {
            removeClientFromList(client)
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
        toggleEditable(clients[index])();
        setLoading(false);

    }

    const onChangeClient = (client: IClient) => {
        const data = tempClients.map(item => item._id === client._id ? ({
            ...item,
            ...client,
        }) : client)
        setTempClients([...data]);
    }

    const onCheckClient = (client: IClient, index: number) => (e: any) => {
        let data: IClient[] = checkedClients;
        if (e.target.checked) {
            data.push(client);
        } else {
            data = data.filter(item => item._id !== client._id);
        }

        setCheckedClients(() => [...data]);
        onSelectClient && onSelectClient(data);
    };

    const setTagToClient = (client: IClient, tag: ITag) => async (e: any) => {
        setLoading(true);
        e.preventDefault();
        let updatedTags = [];
        if (client.tags.indexOf(tag._id) !== -1) {
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
        setLoading(false);
        loadClients();
    }

    const onSelectTag = (tags: ITag[]) => {
        let newClients = allClients;
        if (tags.length) {
            newClients = allClients.filter((clientItem, index) =>
                !!clientItem.tags.find(tagId => tags.find(tagItem => tagItem._id === tagId))
            );
        }

        setSelectedTags(tags.map(tag => tag._id))

        setClients([...newClients]);

        setCheckedClients(tags.length ? [...newClients] : []);
    }

    const toggleAddClientToTag = () => {
        setClients(allClients);
        // setEnableAddClientToTag()
    }

    const tagClient = () => {
        setLoading(true)
        addTagsToClients(JSON.stringify({
            clients: checkedClients,
            tags: selectedTags,
        })).then(async () => {
            setLoading(false)
            await loadClients()
            toast('¡Clientes Etiquetados Exitosamente!')
        })
    }

    return (
        <>
            <Input type="text" onChange={onSearchClient} placeholder="Buscar Client" className="mb-3"/>
            <TagList
                onUpdateTags={loadTags}
                onSelectTag={onSelectTag}
                enableClientsToAddTags={toggleAddClientToTag}
                tagClient={tagClient}/>
            <div className="client-list-container">
                {
                    !loading ? null :
                        <>
                            <div className="loading-sale-container">
                                <Spinner animation="grow" variant="secondary"/>
                            </div>
                        </>
                }
                {clients.length ? [{} as IClient, ...clients].map((client, index) => (
                    <div className="d-flex align-items-center w-100 mb-3 px-4" key={index}>
                        {!client._id || editableList.find(item => item._id === client._id) ?
                            <i className="bi bi-dash-circle-fill cursor-pointer text-danger me-3"
                               onClick={handleDeleteClient(client)}/>
                            : <input
                                className="client-checkbox me-3"
                                type="checkbox"
                                checked={!!checkedClients.find(item => item && item._id === client._id)}
                                onChange={onCheckClient(client, index)}
                                style={{
                                    transform: 'scale(1.2)',
                                }}
                            />}
                        <ClientItem client={{...client, ...(tempClients.find(item => client._id === item._id) || {})}}
                                    editable={!!editableList.find(item => item._id === client._id)}
                                    onChange={onChangeClient}/>
                        <div className="d-flex align-items-center ms-3">
                            {!editableList.find(item => item._id === client._id) ?
                                <>
                                    <i className="bi bi-pencil cursor-pointer text-info"
                                       onClick={toggleEditable(client)}/>
                                    {index === 0 &&
                                      <i className=" ms-3 bi bi-plus-lg cursor-pointer text-success"
                                         onClick={pushClient}/>
                                    }
                                </>
                                :
                                <>
                                    <i className="bi bi-check-lg cursor-pointer me-4 text-success font-weight-bold"
                                       onClick={saveClient(index)}/>
                                    <i className="bi bi-x-lg cursor-pointer text-danger font-weight-bold me-4"
                                       onClick={handleRemoveClient(client)}/>
                                    <Dropdown className={client._id ? '' : 'd-none'} toggle={toggleTagDropdown(index)}
                                              isOpen={tagDropdownIsOpen[index]}>
                                        <DropdownToggle tag="span" outline>
                                            <i className="bi bi-chevron-down cursor-pointer text-info font-weight-bold"/>
                                        </DropdownToggle>
                                        <DropdownMenu>
                                            <DropdownItem toggle={false} header>
                                                Select Tags
                                            </DropdownItem>
                                            {tags.length ? tags.map((tag: ITag, index: number) =>
                                                    <DropdownItem toggle={false}
                                                                  active={!!client.tags && !!client.tags.find(tagI => tagI === tag._id)}
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

                <div className="client-list-scroll-loader-intersector" ref={clientWrapper}/>

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


