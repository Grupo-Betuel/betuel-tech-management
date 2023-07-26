import React from "react";
import {useHistory, useLocation, useParams} from "react-router";
import {IOrder} from "../../../model/ordersModels";
import {getOrderById, updateOrder} from "../../../services/orderService";
import {
    Button,
    Card,
    CardBody,
    CardText,
    CardTitle,
    Input,
    ListGroup,
    ListGroupItem,
    Modal, ModalBody, ModalFooter,
    ModalHeader,
    Spinner
} from "reactstrap";
import "./OrderDetail.scss";
import {ISale} from "../../../model/interfaces/SalesModel";
import {toast} from "react-toastify";

export const OrderDetail = () => {
    const history = useHistory();
    const params: any = useParams();
    const location = useLocation()
    const [loading, setLoading] = React.useState<boolean>(false);
    const [saleToDelete, setSaleToDelete] = React.useState<ISale>();
    const [originalOrder, setOriginalOrder] = React.useState<IOrder>({} as IOrder);
    const [order, setOrder] = React.useState<IOrder>({} as IOrder);

    if (!params?.orderId) {
        history.push('/orders')
    }

    console.log(location.state)

    React.useEffect(() => {
        setLoading(true);
        if (location.state) {
            setOrder(location.state as IOrder)
            setOriginalOrder(location.state as IOrder)
            setLoading(false);
        }
        getOrderDetails()

    }, []);

    const getOrderDetails = async () => {
        const order = await getOrderById(params.orderId);
        if (!order) return history.push('/orders');
        setOrder(order);
        setOriginalOrder(order)
        location.state = order;
        setLoading(false);
    }
    const onChangeSale = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
        const [saleId, field] = e.target.name.split('-');
        const newSales = order.sales?.map((sale) => {
            if (sale._id === saleId) {
                return {
                    ...sale,
                    [field]: value
                }
            }
            return sale;
        })
        const newOrder: IOrder = {
            ...order,
            sales: newSales
        }

        console.log('order', newOrder);
        setOrder(newOrder)
    }

    const saleHasChanged = (sale: ISale) => {
        const originalSale = originalOrder.sales?.find((s) => s._id === sale._id);
        return JSON.stringify(sale) !== JSON.stringify(originalSale);
    }

    const orderHasChanged = () => {
        return JSON.stringify(order) !== JSON.stringify(originalOrder);
    }

    const onChangeSaleParam = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
        const [saleId, paramId, variantId] = e.target.name.split('-');
        const newSales = order.sales?.map((sale) => {
            if (sale._id === saleId) {
                const newParams = sale.params?.map((param) => {
                    if (param._id === paramId) {
                        if (variantId) {
                            const newVariants = param.relatedParams?.map((variant) => {
                                if (variant._id === variantId) {
                                    return {
                                        ...variant,
                                        quantity: value
                                    }
                                }
                                return variant;
                            })

                            return {
                                ...param,
                                quantity: newVariants?.reduce((acc, curr) => acc + ((curr?.quantity || 0) as number), 0) || param.quantity,
                                relatedParams: newVariants
                            }

                        } else {
                            return {
                                ...param,
                                quantity: value
                            }
                        }
                    }
                    return param;
                })
                return {
                    ...sale,
                    quantity: newParams?.reduce((acc, curr) => acc + ((curr?.quantity || 0) as number), 0) || sale.quantity,
                    params: newParams
                }
            }
            return sale;
        })
        console.log('newSales', newSales);
        const newOrder: IOrder = {
            ...order,
            sales: newSales as any
        }

        console.log('order', newOrder);
        setOrder(newOrder)
    }

    const selectSaleToDelete = (sale: ISale) => () => setSaleToDelete(sale)

    const resetSaleToDelete = () => setSaleToDelete(undefined)

    const handleDeleteSale = () => {
        setOrder({
            ...order,
            sales: order.sales?.filter((sale) => sale._id !== saleToDelete?._id)
        })
        resetSaleToDelete();
    }

    const handleUpdateOrder = async () => {
        setLoading(true);
        await updateOrder(JSON.stringify(order));
        setLoading(false);
        getOrderDetails()
        toast('Orden actualizada');
    }
    const goToDashboard = () => {
        history.push('/dashboard')
    }

    const goToOrders = () => {
        history.push('/orders')
    }
    return (
        <div className="order-detail">
            <div className="order-detail-wrapper">
                <div className="d-flex align-items-center justify-content-between gap-3 mb-3">
                    <Button onClick={goToOrders} color="info" outline>Volver a Ordenes</Button>
                    <Button onClick={goToDashboard} color="primary">Dashboard</Button>
                </div>
                {loading && (
                    <>
                        <div className="loading-sale-container">
                            <Spinner animation="grow" variant="secondary"/>
                        </div>
                    </>
                )}
                {order.transferReceipt && <>
                    <h1>Recibo de transferencia</h1>
                    <div className="orders-detail-grid">
                        <Card>
                            <img
                                alt="Card"
                                src={order.transferReceipt?.image}
                            />
                            <CardBody>
                                <CardText>
                                    Status
                                </CardText>
                            </CardBody>
                            <ListGroup flush>
                                <ListGroupItem>
                                    <b>Estado</b>: {order.transferReceipt?.status}
                                </ListGroupItem>
                                <ListGroupItem>
                                    <b>Confirmado por</b>: {order.transferReceipt?.confirmedBy}
                                </ListGroupItem>
                            </ListGroup>
                        </Card>
                    </div>
                </>
                }
                <h1>Productos</h1>
                <div className="orders-detail-grid">
                    {order.sales?.map((sale) => (
                        <div>
                            <Card
                                key={sale?._id}
                                color={saleHasChanged(sale) ? 'warning' : 'light'}
                            >
                                <img
                                    alt="Card"
                                    src={sale.product?.image}
                                />
                                <CardBody>
                                    <CardText>
                                        {sale.product?.name}
                                    </CardText>
                                </CardBody>
                                <ListGroup flush>
                                    <ListGroupItem>
                                        <b>Cantidad</b>: {!sale.params?.length ?
                                        <Input type="number" min={0} name={`${sale._id}-quantity`}
                                               onChange={onChangeSale} value={sale.quantity}/>
                                        : sale.quantity}
                                    </ListGroupItem>
                                    {!!sale.params?.length && <ListGroupItem>
                                        <b className="mb-3">Modelos / Opciones</b> <br/>
                                        {sale.params?.map(param => (
                                            <div>
                                                <label htmlFor="">{param.label} - {param.value}</label>
                                                <br/>
                                                <div className="ps-4">
                                                    <div>
                                                        <b>Cantidad: </b>
                                                        {!param.relatedParams?.length ?
                                                            <Input type="number" min={0}
                                                                   name={`${sale._id}-${param._id}`}
                                                                   onChange={onChangeSaleParam}
                                                                   value={param.quantity}/> :
                                                            param.quantity}
                                                    </div>
                                                    {!!param.relatedParams?.length &&
                                                        <div>
                                                            <b>Variantes</b>
                                                            {param?.relatedParams?.map(variant =>
                                                                <div>
                                                                    <label
                                                                        htmlFor="">{variant.label} - {variant.value}</label>
                                                                    <Input type="number" min={0}
                                                                           name={`${sale._id}-${param._id}-${variant._id}`}
                                                                           onChange={onChangeSaleParam}
                                                                           value={variant.quantity}/>
                                                                </div>
                                                            )}
                                                        </div>}
                                                </div>

                                            </div>
                                        ))}
                                    </ListGroupItem>}
                                    <ListGroupItem>
                                        <b>Precio por unidad</b>: RD$<Input type="number" min={0}
                                                                            name={`${sale._id}-unitPrice`}
                                                                            onChange={onChangeSale}
                                                                            value={sale.unitPrice}/>
                                    </ListGroupItem>
                                    <ListGroupItem>
                                        <b>Total</b>: RD${(sale.unitPrice * (sale.quantity || 0))?.toLocaleString()}
                                    </ListGroupItem>
                                </ListGroup>
                                <CardBody className="d-flex justify-content-between gap-2">
                                    <Button color="danger" className="text-nowrap" onClick={selectSaleToDelete(sale)}>
                                        Eliminar
                                    </Button>
                                </CardBody>
                            </Card>
                        </div>))}
                </div>
                <Modal isOpen={!!saleToDelete} toggle={resetSaleToDelete}>
                    <ModalHeader toggle={resetSaleToDelete}>Confirmación</ModalHeader>
                    <ModalBody>
                        ¿Estas Seguro que deseas eliminar esta Venta?
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={handleDeleteSale}>Confirmar</Button>{' '}
                        <Button color="secondary" onClick={resetSaleToDelete}>Cancel</Button>
                    </ModalFooter>
                </Modal>
            </div>
            <div className="order-detail-footer-actions">
                <Button color="primary" disabled={!orderHasChanged()} onClick={handleUpdateOrder}>Guardar
                    cambios</Button>
            </div>
        </div>
    )
}