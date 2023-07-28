import React, {useEffect, useMemo, useState} from "react";
import FlyerDesigner from "../../components/FlyerDesigner/FlyerDesigner";
import {deleteOrder, getOrders, refreshBotOrders, updateOrder} from "../../services/orderService";
import {IOrder, orderStatusList, OrderStatusTypes} from "../../model/ordersModels";
import "./OrdersManagement.scss";
import {
    AccordionBody,
    AccordionHeader,
    AccordionItem,
    Button,
    Card,
    CardBody, CardLink, CardText,
    CardTitle, Input, ListGroup, ListGroupItem, Modal, ModalBody, ModalFooter, ModalHeader, Spinner,
    Table,
    UncontrolledAccordion
} from "reactstrap";
import {useSocket} from "../../components/hooks/useSocket";
import {onSocketOnce} from "../../utils/socket.io";
import {OrderEvents} from "../../model/socket-events";
import {useHistory, useParams} from "react-router";
import {toast} from "react-toastify";
import {productParamsTypes} from "../../components/ProductModalForm/ProductModalForm";
import {IMessenger, messengerStatusList, MessengerStatusTypes} from "../../model/messengerModels";
import {getMessengers, updateMessenger} from "../../services/messengerService";

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
    const [originalOrders, setOriginalOrders] = useState<IOrder[]>([]);
    const [orderToDelete, setOrderToDelete] = useState<IOrder>();
    const [loading, setLoading] = useState<boolean>();
    const [activeTab, setActiveTab] = useState<'order' | 'messenger'>('order');
    const {connected, socket} = useSocket()
    const history = useHistory();

    const handleGetOrders = async () => {
        setLoading(true);
        const orders = await getOrders();
        setOrders(orders);
        setOriginalOrders(orders);
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
            console.log('orders!', orders);
            onSocketOnce(socket, OrderEvents.CREATED_ORDER, (order: IOrder) => {
                console.log('order create', order, orders);
                const newOrders =  [{...order, fromSocket: true}, ...orders]
                setOrders(newOrders)
                setOriginalOrders([{...order, fromSocket: true}, ...originalOrders])
                console.log('orders', newOrders)
                toast('Nueva orden creada')
            })
            onSocketOnce(socket, OrderEvents.UPDATED_ORDER, (order: IOrder) => {
                console.log('order updated', order)
                const newOrders = orders.map((o) => {
                    if (o._id === order._id) {
                        return {...order, fromSocket: true};
                    }
                    return o;
                })
                const newOriginalOrders = originalOrders.map((o) => {
                    if (o._id === order._id) {
                        return {...order, fromSocket: true};
                    }
                    return o;
                })
                setOrders(newOrders)
                console.log('updated orders', newOrders)
                setOriginalOrders(newOriginalOrders)
                toast('Orden actualizada')
            })

            onSocketOnce(socket, OrderEvents.UPDATED_MESSENGER, (messenger: IMessenger) => {
                console.log('messenger updated', messenger)

                const newMessengers = messengers.map((m) => {
                    if (m._id === messenger._id) {
                        return {...messenger, fromSocket: true};
                    }
                    return m;
                })
                setMessengers(newMessengers)
                toast('Mensajero actualizado')
            });


        }
    }, [connected, orders, originalOrders, messengers, originalMessengers])

    const selectOrderToDelete = (order: IOrder) => () => {
        setOrderToDelete(order);
    }

    const resetOrderToDelete = () => setOrderToDelete(undefined);

    const handleDeleteOrder = async () => {
        if (orderToDelete === undefined) return;
        setLoading(true)
        resetOrderToDelete();
        await deleteOrder(JSON.stringify(orderToDelete))
        setLoading(false)
        handleGetOrders();
        toast('Orden eliminada')
    }

    const goToDetail = (order: IOrder) => () => {
        history.push(`/order-detail/${order._id}`, order)
    }

    const changeOrderStatus = (order: IOrder) => ({target: {value}}: React.ChangeEvent<HTMLInputElement>) => {
        const newOrders = orders.map((o) => {
            if (o._id === order._id) {
                return {...o, status: value} as IOrder
            }
            return o as IOrder;
        })

        setOrders(newOrders)
    }

    const orderHasChanged = (order: IOrder) => {
        const originalOrder = originalOrders.find((o) => o._id === order._id);
        return JSON.stringify(order) !== JSON.stringify(originalOrder);
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

    const goToDashboard = () => {
        history.push('/dashboard')
    }

    const onSearch = ({target: {value}}: React.ChangeEvent<HTMLInputElement>) => {
        const newOrders = originalOrders.filter((o) => JSON.stringify(o).includes(value));
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
    console.log('hostname', hostname);

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
                    <a className={`nav-link ${activeTab === 'order' ? 'active' : ''}`} aria-current="page" href="#" onClick={handleActiveTab('order')}>Ordenes</a>
                </li>
                <li className="nav-item">
                    <a className={`nav-link ${activeTab === 'messenger' ? 'active' : ''}`} href="#" onClick={handleActiveTab('messenger')}>Mensajeros</a>
                </li>
            </ul>
            <div className="orders-management-browser-wrapper p-4">
                <Input bsSize="lg" placeholder="Buscar" onChange={onSearch}/>
            </div>
            <div className="orders-management-grid" style={{width: "100vw"}}>

                { activeTab === 'order' && orders.map((order) => (
                    <Card
                        key={order._id}
                        color={orderStatusCardColor[order.status]}
                        outline={order.fromSocket}
                        inverse={order.status === 'personal-assistance'}
                    >
                        <CardBody>
                            <CardText>
                                <b>ID: </b> {order.orderNumber || order._id}  <br/>{new Date(order.createDate).toLocaleDateString()}.
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
                            <ListGroupItem>
                                <b>Envio</b>: RD${order.shippingPrice?.toLocaleString()}
                            </ListGroupItem>
                            <ListGroupItem>
                                <b>Total</b>: RD${(order.total + order.shippingPrice)?.toLocaleString()}
                            </ListGroupItem>
                            <ListGroupItem>
                                <b>Beneficio</b>: {getOrderProfit(order)}
                            </ListGroupItem>
                            <ListGroupItem>
                                <b>Tipo de Pago</b>: {order.paymentType}
                            </ListGroupItem>
                            <ListGroupItem>
                                <b>Tipo de Orden</b>: {order.type}
                            </ListGroupItem>
                            <ListGroupItem className="d-flex gap-2 align-items-center">
                                <b>Status:</b> <Input placeholder="Tipo"
                                                      onChange={changeOrderStatus(order)} value={order.status}
                                                      type="select">
                                {orderStatusList.map((type: string) =>
                                    <option value={type} key={type}>{type}</option>)
                                }
                            </Input>

                            </ListGroupItem>
                            <ListGroupItem>
                                <b>Cliente</b>: {order.client?.firstName}
                            </ListGroupItem>
                            <ListGroupItem>
                                <b>Mensajero</b>: {order.messenger?.firstName}
                            </ListGroupItem>
                        </ListGroup>
                        <CardBody className="d-flex justify-content-between flex-wrap gap-2">
                            {orderHasChanged(order) &&
                                <Button color="primary" className="text-nowrap w-100 align-self-start"
                                        onClick={handleUpdateOrder(order)}>
                                    Guardar Cambios
                                </Button>}
                            <Button color="danger" className="text-nowrap align-self-start"
                                    onClick={selectOrderToDelete(order)}>
                                Eliminar
                            </Button>
                            <Button color="primary" className="text-nowrap align-self-start"
                                    onClick={goToDetail(order)}>
                                Editar
                            </Button>
                        </CardBody>
                    </Card>))}

                { activeTab === 'messenger' && messengers.map((messenger) => (
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
                                <b>Whatsapp</b>: <a href={`https://wa.me/${messenger.phone}`} target="_blank">{messenger.phone}</a>
                            </ListGroupItem>
                            <ListGroupItem className="d-flex gap-2 align-items-center">
                                <b>Estado:</b> <Input placeholder="Estado"
                                                      onChange={changeMessengerStatus(messenger)} value={messenger.status}
                                                      type="select">
                                {messengerStatusList.map((type: string) =>
                                    <option value={type} key={type}>{type}</option>)
                                }
                            </Input>

                            </ListGroupItem>

                            <ListGroupItem>
                                <b>Cotizando orden:</b> <a href={`${hostname}/order-detail/${messenger.quotingOrder}`} target="_blank">{messenger.quotingOrder}</a>
                            </ListGroupItem>
                            <ListGroupItem>
                                <b>Ordenes asignadas:</b>
                                {
                                    messenger
                                    .currentOrders?.map(id =>
                                        <div key={id}><a href={`${hostname}/order-detail/${id}`} target="_blank">{id}</a> <br/></div>)
                                }
                            </ListGroupItem>
                        </ListGroup>
                        <CardBody className="d-flex justify-content-between flex-wrap gap-2">
                            {hasMessengerChanged(messenger) &&
                                <Button color="primary" className="text-nowrap w-100 align-self-start"
                                        onClick={handleUpdateMessenger(messenger)}>
                                    Guardar Cambios
                                </Button>}
                        </CardBody>
                    </Card>))}
            </div>
            <Modal isOpen={!!orderToDelete} toggle={resetOrderToDelete}>
                <ModalHeader toggle={resetOrderToDelete}>Confirmación</ModalHeader>
                <ModalBody>
                    ¿Estas Seguro que deseas eliminar esta orden?
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={handleDeleteOrder}>Confirmar</Button>{' '}
                    <Button color="secondary" onClick={resetOrderToDelete}>Cancel</Button>
                </ModalFooter>
            </Modal>
        </>
    )
}
