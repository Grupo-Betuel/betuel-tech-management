import React, {useEffect, useMemo, useState} from "react";
import {deleteOrder, getOrders, handleOrderWithBot, refreshBotOrders, updateOrder} from "../../services/orderService";
import {IOrder, orderPaymentTypeList, orderStatusList, OrderStatusTypes, orderTypeList} from "../../model/ordersModels";
import "./OrdersManagement.scss";
import {
    Button,
    Card,
    CardBody, CardFooter,
    CardText,
    Form,
    FormGroup,
    Input,
    Label,
    ListGroup,
    ListGroupItem,
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
import {IMessenger, messengerStatusList, MessengerStatusTypes} from "../../model/messengerModels";
import {addMessenger, deleteMessenger, getMessengers, updateMessenger} from "../../services/messengerService";
import {CreateNewFloatButton} from "../Dashboard/Dashboard";

export const orderStatusCardColor: { [N in OrderStatusTypes]: string } = {
    'pending': 'secondary',
    'confirmed': 'info',
    'canceled': 'danger',
    'cancel-attempt': 'danger',
    'completed': 'success',
    'pending-info': 'warning',
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

export const OrdersManagement = () => {
    const [orders, setOrders] = useState<IOrder[]>([]);
    const [messengers, setMessengers] = useState<IMessenger[]>([]);
    const [originalMessengers, setOriginalMessengers] = useState<IMessenger[]>([]);
    const [originalOrders, setOriginalOrders] = useState<{ [N in string]: IOrder }>({});
    const [elementToDelete, setElementToDelete] = useState<IOrder | IMessenger>();
    const [loading, setLoading] = useState<boolean>();
    const [activeTab, setActiveTab] = useState<'order' | 'messenger'>('order');
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

    useEffect(() => {
        handleGetOrders()
        handleGetMessengers()
    }, [])

    useEffect(() => {
        if (connected && socket) {
            onSocketOnce(socket, OrderEvents.CREATED_ORDER, (order: IOrder) => {
                const newOrders = [{...order, fromSocket: true}, ...orders]
                setOrders(newOrders)
                const originalValues = (Object.values(originalOrders) as IOrder[])
                setOriginalOrders(parseOrdersToObject([{...order, fromSocket: true}, ...originalValues]))
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

    const selectElementToDelete = (order: IOrder | IMessenger) => () => {
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

    const handleDeleteElement = () => {
        if (elementToDelete === undefined) return;
        if (activeTab === 'order') {
            handleDeleteOrder();
        } else if (activeTab === 'messenger') {
            handleDeleteMessenger();
        }
    }

    const goToDetail = (order: IOrder) => () => {
        history.push(`/order-detail/${order._id}`, order)
    }

    const onChangeOrder = (order: IOrder) => ({
                                                  target: {
                                                      value: data,
                                                      name,
                                                      type
                                                  }
                                              }: React.ChangeEvent<HTMLInputElement>) => {
        let value: string | number = data;
        if (type === 'number') value = Number(value);
        const newOrders = orders.map((o) => {
            if (o._id === order._id) {
                return {...o, [name]: value} as IOrder
            }
            return o as IOrder;
        })

        setOrders(newOrders)
    }

    const orderHasChanged = (order: IOrder) => {
        return JSON.stringify(order) !== JSON.stringify(originalOrders[order._id]);
    }

    const hasMessengerChanged = (messenger: IMessenger) => {
        const originalMessenger = originalMessengers.find((m) => m._id === messenger._id);
        return JSON.stringify(messenger) !== JSON.stringify(originalMessenger);
    }

    const handleUpdateOrder = (order: IOrder) => async () => {
        setLoading(true);
        await updateOrder(JSON.stringify(order));
        setLoading(false);
        handleGetOrders();
        toast('Orden actualizada');
    }

    const resetOrderChanges = (order: IOrder) => () => {
        const newOrders = orders.map((o) => {
            if (o._id === order._id) {
                return originalOrders[order._id];
            }
            return o;
        })
        setOrders(newOrders);
    }

    const handleOrderBot = (order: IOrder) => async () => {
        setLoading(true);
        await handleOrderWithBot(JSON.stringify({order, type: 'push'}));
        setLoading(false);
        toast('El bot se ejecuto correctamente');
    }

    const goToDashboard = () => {
        history.push('/dashboard')
    }

    const onSearch = ({target: {value}}: React.ChangeEvent<HTMLInputElement>) => {
        const originalValues = (Object.values(originalOrders) as IOrder[])
        const newOrders = originalValues.filter((o) => JSON.stringify(o).includes(value));
        setOrders(newOrders)
    }

    const handleActiveTab = (tab: 'order' | 'messenger') => () => setActiveTab(tab);

    const changeMessengerStatus = (messenger: IMessenger) => ({target: {value}}: React.ChangeEvent<HTMLInputElement>) => {
        const newMessengers = messengers.map((m) => {
            if (m._id === messenger._id) {
                return {...m, status: value} as IMessenger
            }
            return m as IMessenger;
        })

        setMessengers(newMessengers)
    }

    const hostname: string = useMemo(() => window.location.origin, [window.location.origin])

    const handleUpdateMessenger = (messenger: IMessenger) => async () => {
        setLoading(true);
        await updateMessenger(JSON.stringify(messenger));
        setLoading(false);
        handleGetMessengers();
        toast('Mensajero actualizado');
    }

    const getOrderProfit = (order: IOrder) => {
        return `RD$${order.sales.reduce((acc, sale) => {
            return acc + sale.profit;
        }, 0).toLocaleString()}`
    }

    const handleRefreshBotOrders = async () => {
        setLoading(true);
        await refreshBotOrders();
        setLoading(false);
        toast('Ordenes del bot actualizadas');
    }

    const [messengerToCreate, setMessengerToCreate] = useState<IMessenger>({} as IMessenger);
    const onChangeMessengerCompany = ({target: {name, value}}: React.ChangeEvent<HTMLInputElement>) => {
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

    const handleAddNewMessenger = async () => {

        if (validMessenger(messengerToCreate)) {
            setLoading(true);
            await addMessenger(JSON.stringify(messengerToCreate));
            handleGetMessengers();
            toast("Mensajero creado con exito")
            setLoading(false);
            setMessengerToCreate({} as any);
        }
    }
    return (
        <>
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
                <Button onClick={handleRefreshBotOrders} color="primary">Actualizar las ordenes del bot</Button>
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
            </ul>
            <div className="orders-management-browser-wrapper p-4">
                <Input bsSize="lg" placeholder="Buscar" onChange={onSearch}/>
            </div>
            <div className="orders-management-grid" style={{width: "100vw"}}>

                {activeTab === 'order' && orders.map((order) => (
                    <Card
                        key={order._id}
                        color={orderStatusCardColor[order.status]}
                        outline={order.fromSocket}
                        inverse={order.status === 'personal-assistance'}
                    >
                        <CardBody>
                            <CardText>
                                <b>ID: </b> {order.orderNumber || order._id}
                                <br/>{new Date(order.createDate).toLocaleDateString()}.
                            </CardText>
                        </CardBody>
                        <ListGroup flush>
                            <ListGroupItem>
                                <b>Tienda</b>: {order.company}
                            </ListGroupItem>
                            <ListGroupItem>
                                <b>{order.sales.length} Productos</b>
                            </ListGroupItem>
                            <ListGroupItem>
                                <b>Subtotal</b>: RD${order.total?.toLocaleString()}
                            </ListGroupItem>
                            <ListGroupItem className="d-flex gap-2 align-items-center">
                                <b className="text-nowrap">Envio: RD$</b><Input value={order.shippingPrice}
                                                                                onChange={onChangeOrder(order)}
                                                                                type={'number'}
                                                                                name="shippingPrice"/>
                            </ListGroupItem>
                            <ListGroupItem>
                                <b>Total</b>: RD${(order.total + order.shippingPrice)?.toLocaleString()}
                            </ListGroupItem>
                            <ListGroupItem>
                                <b>Beneficio</b>: {getOrderProfit(order)}
                            </ListGroupItem>
                            <ListGroupItem className="d-flex gap-2 align-items-center">
                                <b className="text-nowrap">Tipo de Pago</b>:
                                <Input placeholder="Tipos de Pagos"
                                       name="paymentType"
                                       onChange={onChangeOrder(order)} value={order.paymentType}
                                       type="select">
                                    <option value="">Seleccionar</option>
                                    {orderPaymentTypeList.map((type: string) =>
                                        <option value={type} key={type}>{type}</option>)
                                    }
                                </Input>
                            </ListGroupItem>
                            <ListGroupItem className="d-flex gap-2 align-items-center">
                                <b className="text-nowrap">Tipo de Orden:</b>
                                <Input placeholder="Tipos"
                                       name="type"
                                       onChange={onChangeOrder(order)} value={order.type}
                                       type="select">
                                    <option value="">Seleccionar</option>

                                    {orderTypeList.map((type: string) =>
                                        <option value={type} key={type}>{type}</option>)
                                    }
                                </Input>
                            </ListGroupItem>
                            <ListGroupItem className="d-flex gap-2 align-items-center">
                                <b>Estado:</b> <Input placeholder="Estados"
                                                      name="status"
                                                      onChange={onChangeOrder(order)} value={order.status}
                                                      type="select">
                                <option value="">Seleccionar</option>

                                {orderStatusList.map((type: string) =>
                                    <option value={type} key={type}>{type}</option>)
                                }
                            </Input>

                            </ListGroupItem>
                            <ListGroupItem>
                                <b>Cliente</b>: {order.client?.firstName}
                            </ListGroupItem>
                            <ListGroupItem className="d-flex gap-2 align-items-center">
                                <b>Mensajero:</b>
                                <Input placeholder="Mensajero"
                                       name="messenger"
                                       onChange={onChangeOrder(order)} value={order.messenger?._id}
                                       type="select">
                                    <option value="">Select Messenger</option>
                                    {originalMessengers.map((m: IMessenger) =>
                                        <option value={m._id} key={m._id}>{m.firstName} {m.lastName}</option>)
                                    }
                                </Input>
                            </ListGroupItem>
                        </ListGroup>
                        <CardBody className="d-flex justify-content-between flex-wrap gap-2">
                            {orderHasChanged(order) &&
                                <>
                                    <Button color="primary" className="text-nowrap w-100 align-self-start"
                                            onClick={handleUpdateOrder(order)}>
                                        Guardar Cambios
                                    </Button>
                                    <Button color="warning" className="text-nowrap w-100 align-self-start"
                                            onClick={resetOrderChanges(order)}>
                                        Revertir Cambios
                                    </Button>
                                </>
                            }
                            <Button color="danger" className="text-nowrap align-self-start"
                                    onClick={selectElementToDelete(order)}>
                                Eliminar
                            </Button>
                            <Button color="primary" className="text-nowrap align-self-start"
                                    onClick={goToDetail(order)}>
                                Detalles
                            </Button>
                            <Button color="primary" outline className="text-nowrap w-100 align-self-start"
                                    onClick={handleOrderBot(order)}>
                                Continuar orden con Bot
                            </Button>
                        </CardBody>
                    </Card>))}


                {activeTab === 'messenger' &&
                    <>
                        <Card>
                            <CardBody>
                                <Form>
                                    {/*firstName: string*/}
                                    {/*lastName: string*/}
                                    {/*phone: string*/}
                                    <FormGroup>
                                        <Label><b>Nombre</b></Label> <br/>
                                        <Input value={messengerToCreate.firstName} name="firstName"
                                               onChange={onChangeMessengerCompany}/>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label><b>Apellido</b></Label> <br/>
                                        <Input value={messengerToCreate.lastName} name="lastName"
                                               onChange={onChangeMessengerCompany}/>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label><b>Telefono (Whatsapp)</b></Label> <br/>
                                        <Input minLength={10} maxLength={11} value={messengerToCreate.phone}
                                               name="phone"
                                               onChange={onChangeMessengerCompany}/>
                                    </FormGroup>
                                </Form>
                            </CardBody>
                            <CardFooter>

                                <Button color="success" onClick={handleAddNewMessenger}>Crear Mensajero</Button>
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
                                        {
                                            messenger
                                                .currentOrders?.map(id =>
                                                <div key={id}><a href={`${hostname}/order-detail/${id}`}
                                                                 target="_blank">{id}</a> <br/></div>)
                                        }
                                    </ListGroupItem>
                                </ListGroup>
                                <CardBody className="d-flex justify-content-between flex-wrap gap-2">
                                    <Button color="danger" className="text-nowrap align-self-start"
                                            onClick={selectElementToDelete(messenger)}>
                                        Eliminar
                                    </Button>
                                    {hasMessengerChanged(messenger) &&
                                        <Button color="primary" className="text-nowrap w-100 align-self-start"
                                                onClick={handleUpdateMessenger(messenger)}>
                                            Guardar Cambios
                                        </Button>}
                                </CardBody>
                            </Card>))}
                    </>
                }
            </div>
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
                // onClick={toggleMessengerForm}
            >
                <i className="bi-plus"/>
            </CreateNewFloatButton>}
        </>
    )
}
