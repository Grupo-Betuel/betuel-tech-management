import {
    Accordion, AccordionBody, AccordionHeader, AccordionItem,
    Button,
    FormGroup,
    Input,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Spinner
} from "reactstrap";
import TableComponent, {IAction, IHeader} from "../Table/Table";
import React, {useEffect} from "react";
import {ISale} from "../../models/interfaces/SalesModel";
import {addSales, deleteSale, updateSales} from "../../services/sales";
import {toast} from "react-toastify";
import {IProductParam} from "../../models/products";
import "./CreateSaleModal.scss";

export interface ICreateSaleModal {
    activeAddSaleModal?: boolean;
    toggleAddSale: () => any;
    selectedSale: ISale;
    salesData: ISale[];
    getSalesData: () => any;
    company: string;
    loadProducts: () => any;
}


const salesHeader: IHeader[] = [
    {
        label: 'Cantidad',
        property: 'quantity',
    },
    {
        label: 'Costo por unidad',
        property: 'unitCost',
    },
    {
        label: 'Precio por unidad',
        property: 'unitPrice',
    },
    {
        label: 'Ganancia por unidad',
        property: 'unitProfit',
    },
    {
        label: 'Ganancia Total',
        property: 'profit',
    },
    {
        label: 'Venta Total',
        property: 'amount',
    },
    {
        label: 'Costo de Envio',
        property: 'shipping',
    },
    {
        label: 'Comisión',
        property: 'commission',
    },
    {
        label: 'Fecha',
        property: 'createDate',
        render: (data) => new Date(data.createDate).toLocaleDateString(),
    },
];

const CreateSaleModal: React.FC<ICreateSaleModal> = (
    {
        activeAddSaleModal,
        toggleAddSale,
        salesData,
        getSalesData,
        selectedSale,
        company,
        loadProducts,
    }) => {
    const [confirmationFunction, setConfirmationFunction] = React.useState<() => any>();
    const [activeConfirmationModal, setActiveConfirmationModal] = React.useState(false);
    const [addingSale, setAddingSale] = React.useState(false);
    const [productSales, setProductSales] = React.useState<ISale[]>([]);
    const [productSalesActive, setProductSalesActive] = React.useState(false);
    const [editSale, setEditSale] = React.useState<Partial<ISale> | null>(null);
    const [sale, setSale] = React.useState<Partial<ISale>>(selectedSale);
    const [selectedSales, setSelectedSales] = React.useState<ISale[]>([]);
    const [useCommission, setUseCommission] = React.useState(false);

    useEffect(() => {
        const gotSale = editSale || selectedSale
        setSale({
            ...gotSale,
        })
    }, [selectedSale, editSale])

    useEffect(() => {
        getAllSalesById()
    }, [salesData])

    const goToCreateSale: any = (value?: boolean) => {
        setProductSalesActive(false);
        setEditSale(null as any);
        setUseCommission(false);
        setSale(selectedSale);
    }

    const useCommissionChange = (e: any) => {
        const {checked} = e.target;
        setUseCommission(checked);
    };


    const toggleConfirmation = () => setActiveConfirmationModal(!activeConfirmationModal);
    const salesAction: IAction[] = [
        {
            label: 'Eliminar',
            method: (sale: ISale) => () => {
                toggleConfirmation();
                setConfirmationFunction(() => async () => {
                    await handleDeleteSale(sale);
                    setActiveConfirmationModal(false)
                })
            },
        },
        {
            label: 'Editar',
            method: (item: ISale) => () => {
                setEditSale(item)
                setUseCommission(!!item.commission)
                setProductSalesActive(false)
            }
        },
    ];

    const handleDeleteSale = async (sale?: ISale) => {
        setActiveConfirmationModal(false);

        setAddingSale(true);
        const pId = (selectedSales[0]?.product?._id || selectedSales[0]?.productId) || sale?.product?._id || sale?.productId;
        const sales = selectedSales.length ? selectedSales.map(item => item._id) : [sale?._id];

        const response = await deleteSale(JSON.stringify({
            sales,
            productId: pId,
        }));
        if (response.status === 204) {
            await getSalesData();
            setSelectedSales([]);
            toast('¡Registro Eliminado Exitosamente!', {type: "default"});
        } else {
            toast('¡Error al eliminar!', {type: "error"});
        }

        setAddingSale(false);
        loadProducts();
    };

    const toggleModal = () => {
        setUseCommission(false);
        setProductSalesActive(false);
        setEditSale(null);
        toggleAddSale();
    };

    const getAllSalesById = (enableProductSales?: boolean) => {
        if (salesData) {
            const newProductSales = salesData
                .filter((item, i) => (item?.product?._id || item?.productId) === (sale?.product?._id || sale?.productId))

            setProductSales([...newProductSales]);
            if (enableProductSales) {
                setProductSalesActive(true);
            }
        }
    };

    const handleSubmit = async () => {
        setAddingSale(true);
        const saleData: Partial<ISale> = {
            ...sale,
            company,
            productId: sale.product?._id || sale.productId,
            product: undefined,
            unitCost: sale.product?.cost || sale.unitCost,
            commission: useCommission ? sale.commission : 0,
        }

        const body = JSON.stringify(saleData);
        let response: Response = {} as any;

        if (editSale) {
            response = await updateSales(body);


        } else {
            response = await addSales(body);
        }

        if (response.status === 201 || response.status === 200) {
            await getSalesData();
            toast('¡Venta Exitosa!', {type: "default"});

        } else {
            toast('¡Error en la Venta!', {type: "error"});
        }
        setAddingSale(false);
        loadProducts();
    };

    const onChangeProduct = (ev: React.ChangeEvent<any>) => {
        const {name, value} = ev.target;
        let {profit} = sale;

        const intValue = Number(value);
        // if(name === "price") {
        //     profit = intValue - (sale ? sale.cost || 0 : 0) ;
        // }
        const newSale = {
            ...sale,
            profit,
            [name]: intValue
        };
        setSale(newSale);
    };


    const onChangeProductParamQuantity = (index: number) => ({target: {value}}: React.ChangeEvent<any>) => {
        // eslint-disable-next-line no-undef
        const newSale = structuredClone(sale);
        if (!newSale.params) return;
        newSale.params[index].quantity = Number(value);
        const total = newSale.params.reduce((acc, item) => acc + (item.quantity || 0), 0);
        setSale({...newSale, quantity: total});
    }

    const onChangeRelatedProductParamValue = (index: number, parentIndex: number) => ({target: {value}}: React.ChangeEvent<any>) => {
        const newSale = structuredClone(sale);
        // @ts-ignore
        const relatedParams = newSale?.params[parentIndex]?.relatedParams;
        if (!relatedParams) return;

        // eslint-disable-next-line no-undef
        relatedParams[index].quantity = Number(value);
        if (newSale.params) {
            newSale.params[parentIndex].relatedParams = relatedParams;
            const relatedParamTotal = relatedParams.reduce((acc, item) => acc + (item.quantity || 0), 0);
            newSale.params[parentIndex].quantity = relatedParamTotal;
            const total = newSale.params.reduce((acc, item) => acc + (item.quantity || 0), 0);

            setSale({...newSale, quantity: total});
        }
    }

    const [paramsOpen, setParamsOpen] = React.useState<string[]>([]);

    const toggleParamsOpen = (id: any) => {
        if (paramsOpen.includes(id)) {
            setParamsOpen(paramsOpen.filter((paramId) => paramId !== id));
        } else {
            setParamsOpen([...paramsOpen, id]);
        }
    }

    const AppAccordion = Accordion as any;

    return (
        <>
            <Modal isOpen={activeConfirmationModal} toggle={toggleConfirmation} backdrop="static" keyboard={false}>
                <ModalHeader toggle={toggleConfirmation}>Confirmación</ModalHeader>
                <ModalBody>
                    ¿Estas Seguro que deseas realizar esta acción?
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={confirmationFunction}>Confirmar</Button>{' '}
                    <Button color="secondary" onClick={toggleConfirmation}>Cancel</Button>
                </ModalFooter>
            </Modal>
            <Modal isOpen={activeAddSaleModal} toggle={toggleModal}>
                <ModalHeader
                    toggle={toggleModal}>{sale?.product?.name} | {editSale ? 'Editar Venta ' + editSale._id : 'Nueva Venta'}</ModalHeader>
                <ModalBody>
                    {
                        addingSale ?
                            <div className="loading-sale-container">
                                <Spinner animation="grow" variant="secondary"/>
                            </div>
                            : null
                    }
                    {
                        productSalesActive || !!editSale ?
                            <Button color="primary" className="mb-3" type="button" outline onClick={goToCreateSale}>
                                Ir a Crear Venta
                            </Button> : null
                    }
                    {productSalesActive ?
                        <>
                            {!!selectedSales.length &&
                                <div className="selected-actinos">
                                    <Button type="button" onClick={() => handleDeleteSale()}>
                                        Eliminar Seleccionadas
                                    </Button>
                                </div>}
                            <TableComponent onSelectItem={(items: any) => setSelectedSales(items)}
                                            data={productSales} headers={salesHeader} actions={salesAction}/>
                        </>
                        :
                        <>
                            <FormGroup>
                                <Label for="priceId">Precio por unidad:</Label>
                                <Input onChange={onChangeProduct} type="number" name="unitPrice" id="priceId"
                                       placeholder="Precio:" value={sale.unitPrice || (sale as any).price}/>
                            </FormGroup>
                            {(!sale.params?.length || editSale) && <FormGroup>
                                <Label for="shippingId">Cantidad:</Label>
                                <Input onChange={onChangeProduct} type="number" name="quantity" id="quantity"
                                       placeholder="Cantidad:" value={sale.quantity}/>
                            </FormGroup>}
                            {/*<Input*/}
                            {/*    id="commission"*/}
                            {/*    type="switch"*/}
                            {/*    label="¿Incluye Comisión?"*/}
                            {/*    checked={useCommission}*/}
                            {/*    className="customized-switch"*/}
                            {/*    onChange={useCommissionChange}/>*/}

                            {sale.params?.map((param: IProductParam, index: number) => {
                                const paramId = `param-${param._id || index}`;
                                const relatedId = `related-${paramId}`;
                                return <>
                                    <AppAccordion
                                        flush
                                        open={paramsOpen}
                                        toggle={toggleParamsOpen}
                                        className="product-param-wrapper"
                                    >
                                        <AccordionItem>
                                            <AccordionHeader targetId={paramId}>
                                                <Label className="d-flex gap-3 align-items-center">
                                                    <b>{param.type?.toUpperCase()}: {param.label?.toUpperCase()}</b>
                                                    {
                                                        param.type === 'color' ?
                                                        <div className="color-value-param"
                                                             style={{backgroundColor: param.value}}></div>
                                                            : <span>{param.value}</span>
                                                    }
                                                </Label>
                                            </AccordionHeader>
                                            <AccordionBody accordionId={paramId}>
                                                <div className="product-param-wrapper">
                                                    {!param.relatedParams?.length &&
                                                        <Input type="number" name="quantity" value={param.quantity}
                                                               placeholder={'Cantidad'}
                                                               onChange={onChangeProductParamQuantity(index)}/>
                                                    }
                                                    {param.relatedParams?.length &&
                                                        param.relatedParams.map((relatedParam: IProductParam, relatedIndex: number) =>
                                                                <div className="related-product-params"
                                                                     key={`related-${relatedIndex}`}>
                                                        <span>
                                                            {relatedParam.label}
                                                        </span>
                                                                    {relatedParam.type === 'color' ?
                                                                        <div className="color-value-param"
                                                                             style={{backgroundColor: relatedParam.value}}></div>
                                                                        :
                                                                        <span>{relatedParam.value}</span>
                                                                    }
                                                                    <Input value={relatedParam.quantity} name="quantity"
                                                                           type={'number'}
                                                                           onChange={onChangeRelatedProductParamValue(relatedIndex, index)}/>
                                                                </div>
                                                        )}
                                                </div>
                                            </AccordionBody>
                                        </AccordionItem>
                                    </AppAccordion>
                                </>
                            })}
                        </>
                    }
                    {
                        !useCommission ? null :
                            <FormGroup>
                                <Label for="commissionId">Comisión:</Label>
                                <Input onChange={onChangeProduct} type="number" name="commission"
                                       id="commissionId" placeholder="Comisión:" value={sale.commission}/>
                            </FormGroup>
                    }
                    <Button color="primary" className="mt-3" outline onClick={() => getAllSalesById(true)}>Todas
                        las Ventas
                    </Button>{' '}


                </ModalBody>
                <ModalFooter>
                    <Button color={productSalesActive ? 'dark' : 'primary'} outline onClick={handleSubmit}
                            disabled={productSalesActive}>{editSale ? 'Actualizar' : 'Añadir'}</Button>{' '}
                    <Button color="secondary" onClick={toggleModal} outline>Cancel</Button>
                </ModalFooter>
            </Modal>
        </>
    )
}

export default CreateSaleModal;
