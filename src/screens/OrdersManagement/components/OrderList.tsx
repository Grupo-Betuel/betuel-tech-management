import {
    Button,
    Card,
    CardBody,
    CardText,
    Input,
    ListGroup,
    ListGroupItem,
    Modal,
    ModalBody, ModalFooter,
    ModalHeader
} from "reactstrap";
import {IOrder, orderPaymentTypeList, orderStatusList, orderTypeList} from "../../../model/ordersModels";
import {IMessenger} from "../../../model/messengerModels";
import React, {useEffect} from "react";
import {orderStatusCardColor} from "../OrdersManagement";
import {useHistory} from "react-router";

export type OrderActionTypes = 'request-messengers' | 'update-location';

export interface IOrderListProps {
    orders: IOrder[];
    updateOrdersList: (orders: IOrder[]) => void;
    messengers: IMessenger[];
    originalOrders: { [N in string]: IOrder };
    updateOrder: (order: IOrder) => Promise<void>;
    onDeleteOrder: (order: IOrder) => void;
    sendOrderToBot: (order: IOrder) => Promise<void>;
    requestMessengers: (order: IOrder) => Promise<void>;
    updateOrderLocation: (order: IOrder, link: string) => Promise<void>;
}


export const OrderList = (
    {
        orders,
        updateOrdersList,
        messengers,
        originalOrders,
        updateOrder,
        onDeleteOrder,
        sendOrderToBot,
        requestMessengers,
        updateOrderLocation,
    }: IOrderListProps) => {
    const history = useHistory();
    const [actionToConfirm, setActionToConfirm] = React.useState<OrderActionTypes>();
    const [actionDataToConfirm, setActionDataToConfirm] = React.useState<IOrder>();
    const [ordersLocation, setOrdersLocation] = React.useState<{ [N in string]: string }>({});


    useEffect(() => {
        Object.keys(originalOrders).forEach((key) => {
            const order = originalOrders[key];
            if (order?.location?.link) {
                setOrdersLocation((old: any) => ({...old, [key]: order?.location?.link}))
            }
        })
        // setOrdersLocation(order?.location?.link)
    }, [originalOrders]);

    const onChangeOrder = (order: IOrder) => ({
                                                  target: {
                                                      value: data,
                                                      name,
                                                      type
                                                  }
                                              }: React.ChangeEvent<HTMLInputElement>) => {
        let value: string | number | any = data;
        if (type === 'number') value = Number(value);
        if (name === 'messenger') {
            const messenger = messengers.find((m) => m._id === value);
            if (messenger) {
                value = messenger;
            }
        }
        const newOrders = orders.map((o) => {
            if (o._id === order._id) {
                return {...o, [name]: value} as IOrder
            }
            return o as IOrder;
        })

        updateOrdersList(newOrders)
    }

    const getOrderProfit = (order: IOrder) => {
        return `RD$${order.sales.reduce((acc, sale) => {
            return acc + sale.profit;
        }, 0).toLocaleString()}`
    }

    const orderHasChanged = (order: IOrder) => {
        return JSON.stringify(order) !== JSON.stringify(originalOrders[order._id]);
    }

    const handleUpdateOrder = (order: IOrder) => async () => {
        await updateOrder(order);
    }

    const resetOrderChanges = (order: IOrder) => () => {
        const newOrders = orders.map((o) => {
            if (o._id === order._id) {
                return originalOrders[order._id];
            }
            return o;
        })
        updateOrdersList(newOrders);
    }

    const handleDeleteOrder = (order: IOrder) => () => {
        onDeleteOrder(order);
    }


    const goToDetail = (order: IOrder) => () => {
        history.push(`/order-detail/${order._id}`, order)
    }

    const handleOrderBot = (order: IOrder) => async () => {
        sendOrderToBot(order);
    }

    const handleRequestMessenger = async (order: IOrder) => {
        requestMessengers(order);
    }

    const resetActionToConfirm = () => {
        setActionDataToConfirm(undefined)
        setActionToConfirm(undefined)
    };

    const onChangeOrderLocation = (order: IOrder) => ({
                                                          target: {
                                                              value: data,
                                                          }
                                                      }: React.ChangeEvent<HTMLInputElement>) => {
        const newOrdersLocation = {...ordersLocation, [order._id]: data};
        setOrdersLocation(newOrdersLocation);
    }

    const handleUpdateOrderLocation = async (order: IOrder) => {
        ordersLocation[order._id] && updateOrderLocation(order, ordersLocation[order._id]);
    }

    const handleActionToConfirm = async () => {
        if(actionDataToConfirm) {
            if(actionToConfirm === 'request-messengers') {
               await handleRequestMessenger(actionDataToConfirm);
            } else if (actionToConfirm === 'update-location') {
               await handleUpdateOrderLocation(actionDataToConfirm);
            }
            resetActionToConfirm();
        }
    }

    const sendActionToConfirm = (action: OrderActionTypes, order: IOrder) => async () => {
        setActionDataToConfirm(order);
        setActionToConfirm(action);
    }

    const orderIsPending = (order: IOrder) => order.status === 'pending' || order.status === 'personal-assistance' || order.status === 'pending-info' || order.status === 'confirmed';
    return (
        <div className="orders-management-grid" style={{width: "100vw"}}>

            {orders.map((order) => (
                <Card
                    key={order._id}
                    color={orderStatusCardColor[order.status]}
                    outline={order.fromSocket}
                    inverse={order.status === 'personal-assistance'}
                >
                    <CardBody>
                        <CardText>
                            <b>ID: </b> {order.orderNumber || order._id}
                            <br/><b>Creacion: </b>{new Date(order.createDate).toLocaleDateString()}.
                            <br/><b>Last Update: </b>{new Date(order.updateDate).toLocaleDateString()}.
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
                        {!!order?.location?.distance &&
                            <ListGroupItem>
                            <b>Distancia</b>: {order?.location?.distance} {order?.location?.distanceUnit}
                        </ListGroupItem>}
                        <ListGroupItem className="d-flex gap-2 align-items-center">
                            <b>Mensajero:</b>
                            <Input placeholder="Mensajero"
                                   name="messenger"
                                   onChange={onChangeOrder(order)} value={order.messenger?._id || ''}
                                   type="select">
                                <option value="">Select Messenger</option>
                                {messengers.map((m: IMessenger) =>
                                    <option value={m._id} key={m._id}>{m.firstName} {m.lastName}</option>)
                                }
                            </Input>
                        </ListGroupItem>
                        {order.type === 'shipping' && order.paymentType &&
                            <ListGroupItem className="d-flex flex-column gap-4">
                            <div className="d-flex flex-column gap-2">
                                <b>Ubicacion</b>
                                <Input
                                    placeholder="Ubicacion"
                                    name="messenger"
                                    value={ordersLocation[order._id]}
                                    onChange={onChangeOrderLocation(order)}
                                />
                            </div>
                            {ordersLocation[order._id] && ordersLocation[order._id] !== order.location?.link &&
                                <Button color="info" outline onClick={sendActionToConfirm('update-location', order)}>Cambiar Ubicacion</Button>}
                        </ListGroupItem>}
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
                                onClick={handleDeleteOrder(order)}>
                            Eliminar
                        </Button>
                        <Button color="primary" className="text-nowrap align-self-start"
                                onClick={goToDetail(order)}>
                            Detalles
                        </Button>
                        <Button color="primary" className="text-nowrap w-100 align-self-start"
                                onClick={handleOrderBot(order)}>
                            Procesar con el BOT
                        </Button>
                        {order.type === 'shipping' && order.paymentType && order.location && orderIsPending(order) &&
                            <Button color="warning" className="text-nowrap w-100 align-self-start"
                                    onClick={sendActionToConfirm('request-messengers', order)}>
                                Solicitar Mensajeros
                            </Button>}
                    </CardBody>
                </Card>))}
            <Modal isOpen={!!actionToConfirm} toggle={resetActionToConfirm}>
                <ModalHeader toggle={resetActionToConfirm}>Confirmación</ModalHeader>
                <ModalBody>
                    ¿Estas seguro que quieres continuar?
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={handleActionToConfirm}>Confirmar</Button>{' '}
                    <Button color="secondary" onClick={resetActionToConfirm}>Cancel</Button>
                </ModalFooter>
            </Modal>
        </div>
    )
}