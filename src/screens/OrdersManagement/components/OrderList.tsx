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
import {
    IOrder,
    ITransferReceipt, UpdateOrderBotActionTypes, IUpdateOrderBotRequest,
    orderPaymentTypeList,
    orderStatusList,
    orderTypeList
} from "../../../model/ordersModels";
import {IMessenger} from "../../../model/messengerModels";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import {orderStatusCardColor} from "../OrdersManagement";
import {useHistory} from "react-router";
import {IMedia, IMediaTagTypes} from "../../../components/GCloudMediaHandler/GCloudMediaHandler";
import {CompanyModel} from "../../../model/companyModel";
import {onChangeMediaToUpload} from "../../../utils/gcloud.utils";
import {deletePhoto} from "../../../services/gcloud";
import {toast} from "react-toastify";
import {getWhatsappNumberURl} from "../../../services/promotions";

export type OrderActionTypes =
    'request-messengers'
    | 'update-location'
    | 'order-resume'
    | 'handle-order'
    | 'update-order'
    | UpdateOrderBotActionTypes

export interface IOrderListProps {
    orders: IOrder[];
    updateOrdersList: (orders: IOrder[]) => void;
    messengers: IMessenger[];
    originalOrders: { [N in string]: IOrder };
    updateOrder: (order: IOrder, action?: UpdateOrderBotActionTypes) => Promise<void>;
    onDeleteOrder: (order: IOrder) => void;
    sendOrderToBot: (order: IOrder) => Promise<void>;
    requestMessengers: (order: IOrder) => Promise<void>;
    sendOrderResume: (order: IOrder) => Promise<void>;
    updateOrderLocation: (order: IOrder, link: string) => Promise<void>;
    selectedOrders: IOrder[];
    selectOrder: (order: IOrder) => void;
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
        sendOrderResume,
        selectedOrders,
        selectOrder,
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

    const handleDeleteOrder = (order: IOrder) => (ev: any) => {
        avoidPropagation(ev)
        onDeleteOrder(order);
    }


    const goToDetail = (order: IOrder) => () => {
        history.push(`/order-detail/${order._id}`, order)
    }

    const handleOrderBot = async (order: IOrder) => {
        sendOrderToBot(order);
    }

    const handleOrderResume = async (order: IOrder) => {
        sendOrderResume(order);
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
        try {
            if (actionDataToConfirm) {
                if (actionToConfirm === 'request-messengers') {
                    await handleRequestMessenger(actionDataToConfirm);
                } else if (actionToConfirm === 'update-location') {
                    await handleUpdateOrderLocation(actionDataToConfirm);
                } else if (actionToConfirm === 'order-resume') {
                    await handleOrderResume(actionDataToConfirm);
                } else if (actionToConfirm === 'handle-order') {
                    await handleOrderBot(actionDataToConfirm);
                } else if (actionToConfirm === 'update-order' || actionToConfirm === 'transfer-confirmed') {
                    await updateOrder(
                        actionDataToConfirm,
                        actionToConfirm !== 'update-order' ? actionToConfirm : undefined
                    );
                }
                resetActionToConfirm();
            }
        } catch (e: any) {
            resetActionToConfirm();
            console.error(e)
            toast('Error:', e.message);

        }
    }

    const sendActionToConfirm = (action: OrderActionTypes, order: IOrder) => async (ev: any) => {
        avoidPropagation(ev);
        setActionDataToConfirm(order);
        setActionToConfirm(action);
    }

    const orderIsPending = (order: IOrder) => order.status === 'pending' || order.status === 'personal-assistance' || order.status === 'pending-info' || order.status === 'confirmed';
    const enableSendResume = useCallback((order: IOrder) => order.type && order.paymentType, [orders]);
    const getTransferStatus = useCallback((order: IOrder) => {
        let status = '🚫No recibida 🚫';
        if (order.transferReceipt) {
            status = order.transferReceipt.status === 'confirmed' ? '✅ Confirmada ✅' : '☢️ Pendiente de confirmación ☢️';
        }

        return status;
    }, [orders]);


    const onChangeTransferReceipt = (order: IOrder) => async (event: any) => {
        const mediaType: IMediaTagTypes = 'receipt';


        const onload = async (content: IMedia) => {
            const transferReceipt: ITransferReceipt = {order: order._id, status: 'pending', image: content.content};
            await updateOrder({...order, transferReceipt})
        }

        await onChangeMediaToUpload(mediaType, onload, `${order._id}-${mediaType}`)(event)
        if (order.transferReceipt) {
            const mediaToDelete = order.transferReceipt.image?.split('/')?.pop();
            mediaToDelete && await deletePhoto(mediaToDelete);
        }
    }

    const handleSelectOrder = (order: IOrder) => (ev: any) => {
        ev.stopPropagation();
        selectOrder(order);
    }

    const isSelected = useCallback((order: IOrder) => {
        return selectedOrders.findIndex((o) => o._id === order._id) !== -1;
    }, [orders, selectedOrders])

    const avoidPropagation = (ev: any) => ev.stopPropagation();
    const fromStatistics = useMemo(() => {
        const data: { [N in string]: number } = {};
        Object.keys(originalOrders).forEach((key) => {
            const order = originalOrders[key];
            data[order.from] = (data[order.from] || 0) + 1;
        });
        return data;
    }, [originalOrders]);

    return (
        <div>
            <div className="px-4">
                <h2>Total Orders: {orders.length}</h2>
                <div className="d-flex flex-wrap gap-3 align-items-center w-100">
                    {
                        Object.keys(fromStatistics).map((key) => (
                            <div><b>{key}</b>: {fromStatistics[key]}</div>
                        ))
                    }
                </div>
            </div>
            <div className="orders-management-grid">

                {orders.map((order) => (
                    <Card
                        key={order._id}
                        color={orderStatusCardColor[order.status]}
                        outline={order.fromSocket}
                        inverse={order.status === 'personal-assistance'}
                        onClick={handleSelectOrder(order)}
                        className={`orders-management-grid-item ${isSelected(order) ? 'selected' : ''}`}

                    >
                        <CardBody>
                            <CardText>
                                <b>ID: </b> {(order.orderNumber || order._id).toString().toUpperCase()}
                                <br/><b>from: </b>{order.from}.
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
                                <b className="text-nowrap">Envio: RD$</b>
                                <Input
                                    onClick={avoidPropagation}
                                    value={order.shippingPrice}
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
                                <Input
                                    onClick={avoidPropagation}
                                    placeholder="Tipos de Pagos"
                                    name="paymentType"
                                    onChange={onChangeOrder(order)} value={order.paymentType}
                                    type="select">
                                    <option value="">Seleccionar</option>
                                    {orderPaymentTypeList.map((type: string) =>
                                        <option value={type} key={type}>{type}</option>)
                                    }
                                </Input>
                            </ListGroupItem>
                            {order.paymentType === 'transfer' &&
                                <ListGroupItem className="d-flex gap-2 flex-column">
                                    <b className="text-nowrap">Estado de Transferencia</b>
                                    <i>{getTransferStatus(order)}</i>
                                    {order.transferReceipt && order.transferReceipt.status === 'pending' &&
                                        <Button color="success" onClick={
                                            sendActionToConfirm('transfer-confirmed',
                                                {
                                                    ...order,
                                                    status: 'pending',
                                                    transferReceipt: {
                                                        ...order.transferReceipt,
                                                        status: 'confirmed',
                                                        confirmedBy: 'admin',
                                                    }
                                                })}>Confirmar Transferencia</Button>}
                                    <label
                                        onClick={avoidPropagation}
                                        className="btn btn-outline-success w-100 position-relative" htmlFor="file">
                                        Subir {order.transferReceipt && 'otro'} recibo
                                        <input
                                            onClick={avoidPropagation}
                                            className="invisible position-absolute top-0 left-0 start-0"
                                            onChange={onChangeTransferReceipt(order)}
                                            type="file"
                                            name="file"
                                            id="file"
                                            accept="image/png,image/jpg,image/jpeg"
                                        />
                                    </label>

                                </ListGroupItem>}
                            <ListGroupItem className="d-flex gap-2 align-items-center">
                                <b className="text-nowrap">Tipo de Orden:</b>
                                <Input placeholder="Tipos"
                                       name="type"
                                       onClick={avoidPropagation}
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
                            <ListGroupItem className="d-flex align-items-center gap-2 justify-content-between">
                                <div>
                                    <b>Cliente:</b> {order.client?.firstName}
                                </div>
                                <Button color="primary" outline><a target="_blank" className="text-decoration-none"
                                                                   href={getWhatsappNumberURl(order?.client?.phone)}>Contactar</a></Button>
                            </ListGroupItem>
                            {!!order?.location?.distance &&
                                <ListGroupItem>
                                    <b>Distancia</b>: {order?.location?.distance} {order?.location?.distanceUnit}
                                </ListGroupItem>}
                            <ListGroupItem className="d-flex gap-2 align-items-center">
                                <b>Mensajero:</b>
                                <Input placeholder="Mensajero"
                                       name="messenger"
                                       onClick={avoidPropagation}
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
                                            onClick={avoidPropagation}
                                            placeholder="Ubicacion"
                                            name="messenger"
                                            value={ordersLocation[order._id]}
                                            onChange={onChangeOrderLocation(order)}
                                        />
                                    </div>
                                    {ordersLocation[order._id] && ordersLocation[order._id] !== order.location?.link &&
                                        <Button color="info" outline
                                                onClick={sendActionToConfirm('update-location', order)}>Cambiar
                                            Ubicacion</Button>}
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
                            {enableSendResume(order) &&
                                <Button color="info" className="text-nowrap w-100 align-self-start"
                                        onClick={sendActionToConfirm('order-resume', order)}>
                                    Enviar Resumen al Cliente
                                </Button>}
                            <Button color="primary" className="text-nowrap w-100 align-self-start"
                                    onClick={sendActionToConfirm('handle-order', order)}>
                                Procesar con b-bOt
                            </Button>
                            {order.type === 'shipping' && order.paymentType && order.location && orderIsPending(order) &&
                                <Button color="warning" className="text-nowrap w-100 align-self-start"
                                        onClick={sendActionToConfirm('request-messengers', order)}>
                                    Solicitar Mensajeros
                                </Button>}
                            {order.type && order.paymentType && !order.finished &&
                                <Button color="success" className="text-nowrap w-100 align-self-start"
                                        onClick={sendActionToConfirm('handle-order', {...order, status: 'completed' })}>
                                    Finalizar Orden
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
        </div>
    )
}