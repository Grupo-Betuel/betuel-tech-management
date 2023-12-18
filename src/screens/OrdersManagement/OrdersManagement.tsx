import React, {useEffect, useState} from "react";
import {
    deleteOrder,
    getOrders,
    handleOrderWithBot,
    refreshBotOrders, sendOrderResume, sendRequestMessenger, sendUpdateOrderBot,
    senUpdateOrderLocation,
    updateOrder
} from "../../services/orderService";
import {
    IClient,
    IOrder, UpdateOrderBotActionTypes,
    OrderStatusTypes
} from "../../model/ordersModels";
import "./OrdersManagement.scss";
import {
    Button,
    Input,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Spinner,
} from "reactstrap";
import {useSocket} from "../../components/hooks/useSocket";
import {onSocketOnce} from "../../utils/socket.io";
import {OrderEvents} from "../../model/socket-events";
import {useHistory} from "react-router";
import {toast} from "react-toastify";
import {IMessenger, MessengerStatusTypes} from "../../model/messengerModels";
import {addMessenger, deleteMessenger, getMessengers, updateMessenger} from "../../services/messengerService";
import {CreateNewFloatButton} from "../Dashboard/Dashboard";
import {MessengerMng} from "./components/MessengerMng/MessengerMng";
import {OrderList} from "./components/OrderList";
import {ClientMng} from "./components/ClientMng/ClientMng";
import {addClient, deleteClient, getClients, updateClients} from "../../services/clients";
import { PrintOrdersSheet} from "../../components/PrintSheet/PrintOrdersSheet";
import {ShippingCard} from "../../components/ShippingCard/ShippingCard";
import {DraggableGridItem} from "../../components/DraggableGrid/DraggableGrid";
import {betuelDanceShippingCardLayout} from "../../components/FlyerDesigner/constants/shipping-card-layouts";

const items: DraggableGridItem[] = [
    { id: '1', content: <ShippingCard layout={betuelDanceShippingCardLayout}/>, x: 0, y: 0, w:2, h:2 },
    { id: '2', content:  <ShippingCard layout={betuelDanceShippingCardLayout}/>, x: 1, y: 1, w:1, h:1 },
];

export type OrderTabsTypes = 'order' | 'messenger' | 'clients'
export const orderStatusCardColor: { [N in OrderStatusTypes]: string } = {
    'pending': 'secondary',
    'confirmed': 'info',
    'canceled': 'danger',
    'cancel-attempt': 'danger',
    'completed': 'success',
    'pending-info': 'warning',
    'pending-confirm': 'info',
    'personal-assistance': 'dark',
    'checking-transfer': 'warning',
    'delivering': 'warning',
    'delivered': 'light',
}

export const messengerStatusCardColor: { [N in MessengerStatusTypes]: string } = {
    'available': 'success',
    'unavailable': 'danger',
    'quoting': 'info',
    'on-trip-to-office': 'warning',
    'on-trip-to-client': 'warning',
}

const maxOrderSelection = 6;

export const OrdersManagement = () => {
    const [orders, setOrders] = useState<IOrder[]>([]);
    const [messengers, setMessengers] = useState<IMessenger[]>([]);
    const [clients, setClients] = useState<IClient[]>([]);
    const [originalMessengers, setOriginalMessengers] = useState<IMessenger[]>([]);
    const [originalClients, setOriginalClients] = useState<IClient[]>([]);
    const [originalOrders, setOriginalOrders] = useState<{ [N in string]: IOrder }>({});
    const [elementToDelete, setElementToDelete] = useState<IOrder | IMessenger | IClient>();
    const [loading, setLoading] = useState<boolean>();
    const [activeTab, setActiveTab] = useState<OrderTabsTypes>('order');
    const {connected, socket} = useSocket()
    const history = useHistory();

    const parseOrdersToObject = (orders: IOrder[]) => {
        const parsedOrders: { [N in string]: IOrder } = {};
        orders.forEach(order => {
            parsedOrders[order._id] = order;
        })
        return parsedOrders;
    }
    const handleGetOrders = async () => {
        setLoading(true);
        const orders = await getOrders();
        setOrders(orders);
        setOriginalOrders(parseOrdersToObject(orders));
        setLoading(false);
    }

    const handleGetMessengers = async () => {
        setLoading(true);
        const messengers = await getMessengers();
        setMessengers(messengers);
        setOriginalMessengers(messengers);
        setLoading(false);
    }

    const handleGetClients = async () => {
        setLoading(true);
        const clients = await getClients();
        setClients(clients);
        setOriginalClients(clients);
        setLoading(false);
    }

    useEffect(() => {
        handleGetOrders()
        handleGetMessengers()
        handleGetClients();
    }, [])

    useEffect(() => {
        if (connected && socket) {
            onSocketOnce(socket, OrderEvents.CREATED_ORDER, (order: IOrder) => {
                const newOrder: IOrder = {...order, fromSocket: true}
                const newOrders = [newOrder, ...orders]
                setOrders(newOrders)
                const originalValues = (Object.values(originalOrders) as IOrder[])
                setOriginalOrders(parseOrdersToObject([newOrder, ...originalValues]))
            })

            onSocketOnce(socket, OrderEvents.UPDATED_ORDER, (order: IOrder) => {
                let newOrderChanged = order;
                const newOrders = orders.map((o) => {
                    if (o._id === order._id) {
                        newOrderChanged = {...order, fromSocket: true};
                        return newOrderChanged
                    }
                    return o;

                })
                const newOriginalOrders = originalOrders;
                newOriginalOrders[order._id] = newOrderChanged;

                setOrders(newOrders)
                setOriginalOrders(newOriginalOrders)
            })

            onSocketOnce(socket, OrderEvents.UPDATED_MESSENGER, (messenger: IMessenger) => {

                const newMessengers = messengers.map((m) => {
                    if (m._id === messenger._id) {
                        return {...messenger, fromSocket: true};
                    }
                    return m;
                })
                const newOriginalMessengers = originalMessengers.map((m) => {
                    if (m._id === messenger._id) {
                        return {...messenger, fromSocket: true};
                    }
                    return m;
                })
                setMessengers(newMessengers)
                setOriginalMessengers(newOriginalMessengers)
            });


        }
    }, [connected, orders, originalOrders, messengers, originalMessengers])

    const selectElementToDelete = (order: IOrder | IMessenger) => {
        setElementToDelete(order);
    }

    const resetElementToDelete = () => setElementToDelete(undefined);

    const handleDeleteOrder = async () => {
        if (elementToDelete === undefined) return;
        setLoading(true)
        resetElementToDelete();
        await deleteOrder(JSON.stringify(elementToDelete))
        setLoading(false)
        handleGetOrders();
        toast('Orden eliminada')
        handleRefreshBotOrders();

    }

    const handleDeleteMessenger = async () => {
        setLoading(true)
        await deleteMessenger(JSON.stringify(elementToDelete))
        setLoading(false)
        resetElementToDelete();
        handleGetMessengers();
        toast('Mensajero eliminado');
    }

    const handleDeleteClient = async () => {
        setLoading(true)
        await deleteClient(JSON.stringify(elementToDelete))
        setLoading(false)
        resetElementToDelete();
        handleGetClients();
        toast('Cliente eliminado');
    }

    const handleDeleteElement = () => {
        if (elementToDelete === undefined) return;
        if (activeTab === 'order') {
            handleDeleteOrder();
        } else if (activeTab === 'messenger') {
            handleDeleteMessenger();
        } else if (activeTab === 'clients') {
            handleDeleteClient();
        }
    }

    const goToDashboard = () => {
        history.push('/dashboard')
    }


    const handleUpdateOrder = async (order: IOrder, action?: UpdateOrderBotActionTypes) => {
        setLoading(true);
        await updateOrder(JSON.stringify(order));
        if (action) {
            await sendUpdateOrderBot({order, action});
        }
        setLoading(false);
        handleGetOrders();
        toast('Orden actualizada');
    }

    const handleOrderBot = async (order: IOrder) => {
        setLoading(true);
        await handleOrderWithBot(JSON.stringify({order, type: 'push'}));
        setLoading(false);
        toast('El bot se ejecuto correctamente');
    }

    const onSearch = ({target: {value: data}}: React.ChangeEvent<HTMLInputElement>) => {
        const value = data.toLowerCase().replace(/[ ]/gi, '');
        const filterObjectWithValue = (obj: any) => JSON.stringify(obj).toLowerCase().replace(/[ ]/gi, '').includes(value);
        if (activeTab === 'order') {
            const originalValues = (Object.values(originalOrders) as IOrder[])
            const newOrders = originalValues.filter((o) => filterObjectWithValue(o));
            setOrders(newOrders)
        } else if (activeTab === 'messenger') {
            const newMessengers = originalMessengers.filter((m) => filterObjectWithValue(m));
            setMessengers(newMessengers)
        } else if (activeTab === 'clients') {
            const newClients = originalClients.filter((c) => filterObjectWithValue(c));
            setClients(newClients)
        }

    }

    const handleActiveTab = (tab: OrderTabsTypes) => () => setActiveTab(tab);


    const handleUpdateMessenger = async (messenger: IMessenger) => {
        setLoading(true);
        await updateMessenger(JSON.stringify(messenger));
        setLoading(false);
        handleGetMessengers();
        toast('Mensajero actualizado');
    }
    const handleUpdateClient = async (client: IClient) => {
        setLoading(true);
        await updateClients(JSON.stringify(client));
        setLoading(false);
        handleGetClients();
        toast('Cliente actualizado');
    }


    const handleRefreshBotOrders = async () => {
        setLoading(true);
        await refreshBotOrders();
        setLoading(false);
        toast('Ordenes del bot actualizadas');
    }

    const handleAddNewMessenger = async (messenger: IMessenger) => {
        setLoading(true);
        await addMessenger(JSON.stringify(messenger));
        handleGetMessengers();
        toast("Mensajero creado con exito")
        setLoading(false);
    }

    const handleAddNewClient = async (client: IClient) => {
        setLoading(true);
        await addClient(JSON.stringify(client));
        handleGetClients();
        toast("Cliente creado con exito")
        setLoading(false);
    }


    const updateOrderLocation = async (order: IOrder, link: string) => {
        setLoading(true);
        await senUpdateOrderLocation({order, link});
        setLoading(false);
        toast("Orden actualizada con exito")
    }

    const requestMessengers = async (order: IOrder) => {
        setLoading(true);
        await sendRequestMessenger({order});
        setLoading(false);
        toast("Orden actualizada con exito")
    }

    const orderResume = async (order: IOrder) => {
        setLoading(true);
        await sendOrderResume({order});
        setLoading(false);
        toast("Orden actualizada con exito")
    }

    const [printModalOpen, setPrintModalOpen] = useState(false);
    const togglePrintModal = () => setPrintModalOpen(!printModalOpen);
    const [selectedOrders, setSelectedOrders] = useState<IOrder[]>([]);

    const selectOrder = (order: IOrder) => {
        if(maxOrderSelection === selectedOrders.length) {
            toast(`Solo puedes seleccionar ${maxOrderSelection} ordenes`);
            return;
        }

        const newSelectedOrders = [...selectedOrders];
        const index = newSelectedOrders.findIndex((o) => o._id === order._id);
        if (index !== -1) {
            newSelectedOrders.splice(index, 1);
        } else {
            newSelectedOrders.push(order);
        }

        setSelectedOrders(newSelectedOrders);
    }


    return (
        <>
            <Modal isOpen={printModalOpen}
                   toggle={togglePrintModal}
                   contentClassName="print-modal-content"
                   className="print-modal"
            >
                <ModalHeader toggle={togglePrintModal}>Imprimir Ordenes</ModalHeader>
                <ModalBody className="print-modal-body">
                    <PrintOrdersSheet orders={selectedOrders} />
                </ModalBody>
            </Modal>
            {loading && (
                <>
                    <div className="loading-sale-container">
                        <Spinner animation="grow" variant="secondary"/>
                    </div>
                </>
            )}
            <div className="d-flex align-items-center justify-content-between gap-3 p-3">
                <h1>Ultimas Ordenes</h1>
                <Button onClick={goToDashboard} color="primary">Dashboard</Button>
                <Button onClick={handleRefreshBotOrders} color="primary">Syncronizar las ordenes del BOT</Button>
                {!!selectedOrders.length && <Button color="warning" className="text-white d-flex align-items-center gap-2" onClick={togglePrintModal}>
                    <i className="bi bi-printer" />
                    Imprimir Seleccionadas
                </Button>}

            </div>
            <ul className="nav nav-tabs">
                <li className="nav-item">
                    <a className={`nav-link ${activeTab === 'order' ? 'active' : ''}`} aria-current="page" href="#"
                       onClick={handleActiveTab('order')}>Ordenes</a>
                </li>
                <li className="nav-item">
                    <a className={`nav-link ${activeTab === 'messenger' ? 'active' : ''}`} href="#"
                       onClick={handleActiveTab('messenger')}>Mensajeros</a>
                </li>
                <li className="nav-item">
                    <a className={`nav-link ${activeTab === 'clients' ? 'active' : ''}`} href="#"
                       onClick={handleActiveTab('clients')}>Clientes</a>
                </li>
            </ul>
            <div className="orders-management-browser-wrapper p-4">
                <Input bsSize="lg" placeholder="Buscar" onChange={onSearch}/>
            </div>
            {activeTab === 'order' &&
                <OrderList
                    updateOrder={handleUpdateOrder}
                    orders={orders}
                    updateOrdersList={setOrders}
                    messengers={originalMessengers}
                    originalOrders={originalOrders}
                    onDeleteOrder={selectElementToDelete}
                    sendOrderToBot={handleOrderBot}
                    requestMessengers={requestMessengers}
                    updateOrderLocation={updateOrderLocation}
                    sendOrderResume={orderResume}
                    selectOrder={selectOrder}
                    selectedOrders={selectedOrders}
                />
            }
            {activeTab === 'messenger' &&
                <MessengerMng
                    originalMessengers={originalMessengers}
                    updateMessenger={handleUpdateMessenger}
                    updateMessengerList={setMessengers}
                    addNewMessenger={handleAddNewMessenger}
                    onDeleteMessenger={setElementToDelete}
                    messengers={messengers}/>}
            {activeTab === 'clients' &&
                <ClientMng
                    originalClients={originalClients}
                    updateClient={handleUpdateClient}
                    updateClientList={setClients}
                    addNewClient={handleAddNewClient}
                    onDeleteClient={setElementToDelete}
                    clients={clients}/>}
            <Modal isOpen={!!elementToDelete} toggle={resetElementToDelete}>
                <ModalHeader toggle={resetElementToDelete}>Confirmación</ModalHeader>
                <ModalBody>
                    ¿Estas Seguro que deseas proceder a eliminar?
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={handleDeleteElement}>Confirmar</Button>{' '}
                    <Button color="secondary" onClick={resetElementToDelete}>Cancel</Button>
                </ModalFooter>
            </Modal>
            {activeTab === 'messenger' && <CreateNewFloatButton
                className="btn btn-outline-danger"
                // onClick={toggleClientForm}
            >
                <i className="bi-plus"/>
            </CreateNewFloatButton>}
        </>)
}
