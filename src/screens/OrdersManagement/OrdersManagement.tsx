import React, {useEffect, useMemo, useState} from "react";
import FlyerDesigner from "../../components/FlyerDesigner/FlyerDesigner";
import {deleteOrder, getOrders, updateOrder} from "../../services/orderService";
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

export const statusCardColor: { [N in OrderStatusTypes]: string } = {
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
export const OrdersManagement = () => {
    const [orders, setOrders] = useState<IOrder[]>([]);
    const [originalOrders, setOriginalOrders] = useState<IOrder[]>([]);
    const [orderToDelete, setOrderToDelete] = useState<IOrder>();
    const [loading, setLoading] = useState<boolean>();
    const {connected, socket} = useSocket()
    const history = useHistory();

    const handleGetOrders = async () => {
        setLoading(true);
        const orders = await getOrders();
        setOrders(orders);
        setOriginalOrders(orders);
        setLoading(false);
    }

    useEffect(() => {
        handleGetOrders()
    }, [])

    useEffect(() => {
        if (connected && socket) {
            onSocketOnce(socket, OrderEvents.CREATED_ORDER, (order: IOrder) => {
                setOrders([{...order, fromSocket: true}, ...orders])
                toast('Nueva orden creada')
            })
            onSocketOnce(socket, OrderEvents.UPDATED_ORDER, (order: IOrder) => {
                const newOrders = orders.map((o) => {
                    if (o._id === order._id) {
                        return {...order, fromSocket: true};
                    }
                    return o;
                })
                setOrders(newOrders)
                toast('Orden actualizada')
            })
        }
    }, [connected])

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

    return (
        <>
            <div className="d-flex align-items-center justify-content-between gap-3 p-3">
                <h1>Ultimas Ordenes</h1>
                <Button onClick={goToDashboard} color="primary">Dashboard</Button>
            </div>
            <div className="orders-management-browser-wrapper p-4">
                <Input bsSize="lg" placeholder="Buscar" onChange={onSearch}/>
            </div>
            <div className="orders-management-grid" style={{width: "100vw"}}>
                {loading && (
                    <>
                        <div className="loading-sale-container">
                            <Spinner animation="grow" variant="secondary"/>
                        </div>
                    </>
                )}
                {orders.map((order) => (
                    <Card
                        key={order._id}
                        color={order.fromSocket ? "success" : statusCardColor[order.status]}
                        outline={order.fromSocket}
                        inverse={order.status === 'personal-assistance'}
                    >
                        <CardBody>
                            <CardText>
                                <b>ID: </b> {order._id} <br/>{new Date(order.createDate).toLocaleDateString()}.
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
                                    <option value={type}>{type}</option>)
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
