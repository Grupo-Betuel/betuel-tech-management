import {
    Button,
    CustomInput,
    FormGroup,
    Input,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Spinner
} from "reactstrap";
import TableComponent, { IAction, IHeader } from "../Table/Table";
import React, { useEffect } from "react";
import { ISale } from "../../model/interfaces/SalesModel";
import { addSales } from "../../services/sales";
import { toast } from "react-toastify";

export interface ICreateSaleModal {
    activeAddSaleModal?: boolean;
    toggleAddSale: () => any;
    editSale: ISale;
    salesData: ISale[];
    handleDeleteSale: (_id: number) => Promise<any>;
    getSalesData: () => any;
}


const salesHeader: IHeader[] = [
    {
        label: 'Precio',
        property: 'price',
    },
    {
        label: 'Costo',
        property: 'cost',
    },
    {
        label: 'Ganancia',
        property: 'profit',
    },
    {
        label: 'Costo de Envio',
        property: 'shipping',
    },
    {
        label: 'Comisión',
        property: 'commission',
    },
];

const CreateSaleModal: React.FC<ICreateSaleModal> = (
    {
        activeAddSaleModal,
        toggleAddSale,
        salesData,
        handleDeleteSale,
        getSalesData,
        editSale,
    }) => {
    const [confirmationFunction, setConfirmationFunction] = React.useState<() => any>();
    const [activeConfirmationModal, setActiveConfirmationModal] = React.useState(false);
    const [addingSale, setAddingSale] = React.useState(false);
    const [productSales, setProductSales] = React.useState<ISale[]>([]);
    const [productSalesActive, setProductSalesActive] = React.useState(false);
    const [sale, setSale] = React.useState<Partial<ISale>>(editSale);
    const [useCommission, setUseCommission] = React.useState(false);
    console.log(editSale, 'klk');

    useEffect(() => {
        setSale(editSale)
    }, [editSale])

    const toggleProductSales: any = (value?: boolean) => setProductSalesActive(!productSalesActive);

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
                    console.log('hi');
                    await handleDeleteSale(sale._id);
                    setActiveConfirmationModal(false)
                })
            },
        },
        {
            label: 'Editar',
            method: (item) => () => {

            }
        },
    ];


    const toggleModal = () => {
        setUseCommission(false);
        setProductSalesActive(false);
        toggleAddSale();
    };

    const getAllSalesById = () => {
        if (salesData) {
            const newProductSales = salesData.filter((item, i) => item.productId === sale.productId);
            setProductSales([...newProductSales]);
            setProductSalesActive(true);
        }
    };

    const newSale = async () => {
        setAddingSale(true);
        const saleData: Partial<ISale> = {
            ...sale,
            commission: useCommission ? sale.commission : 0,
        }
        const body = JSON.stringify(saleData);

        const response = await addSales(body);

        if (response.status === 201) {
            await getSalesData();
            toast('¡Venta Exitosa!', {type: "default"});

        } else {
            toast('¡Error en la Venta!', {type: "error"});
        }
        setAddingSale(false);

    };

    const onChangeProduct = (ev: React.ChangeEvent<any>) => {
        const {name, value} = ev.target;
        let {profit} = sale;

        const intValue = Number(value);
        if(name === "price") {
            profit = intValue - (sale ? sale.cost || 0 : 0) ;
        }
        const newSale = {
            ...sale,
            profit,
            [name]: intValue
        };
        setSale(newSale);
    };


    return (
        <>
            <Modal isOpen={activeConfirmationModal} toggle={toggleConfirmation}>
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
                <ModalHeader toggle={toggleModal}>{sale.productName} | Nueva Venta</ModalHeader>
                <ModalBody>
                    {
                        addingSale ?
                            <div className="loading-sale-container">
                                <Spinner animation="grow" variant="secondary"/>
                            </div>
                            : null
                    }
                    {productSalesActive ?
                        <>
                            <Button color="primary" className="mb-3" type="button" outline onClick={toggleProductSales}>Crear
                                Venta</Button>
                            <TableComponent data={productSales} headers={salesHeader} actions={salesAction}/>
                        </>
                        :
                        <>
                            <FormGroup>
                                <Label for="priceId">Precio:</Label>
                                <Input onChange={onChangeProduct} type="number" name="price" id="priceId"
                                       placeholder="Precio:" value={sale.price}/>
                            </FormGroup>
                            <FormGroup>
                                <Label for="shippingId">Envio:</Label>
                                <Input onChange={onChangeProduct} type="number" name="shipping" id="shippingId"
                                       placeholder="Envio:" value={sale.shipping}/>
                            </FormGroup>
                            <>
                                <CustomInput
                                    type="switch"
                                    label="¿Incluye Comisión?"
                                    checked={useCommission}
                                    className="customized-switch"
                                    onChange={useCommissionChange}/>
                            </>
                            {
                                !useCommission ? null :
                                    <FormGroup>
                                        <Label for="commissionId">Comisión:</Label>
                                        <Input onChange={onChangeProduct} type="number" name="commission"
                                               id="commissionId" placeholder="Comisión:" value={sale.commission}/>
                                    </FormGroup>
                            }
                            <Button color="primary" className="mt-3" outline onClick={getAllSalesById}>Todas las
                                Ventas</Button>{' '}
                        </>
                    }


                </ModalBody>
                <ModalFooter>
                    <Button color={productSalesActive ? 'dark' : 'primary'} outline onClick={newSale}
                            disabled={productSalesActive}>Añadir</Button>{' '}
                    <Button color="secondary" onClick={toggleModal} outline>Cancel</Button>
                </ModalFooter>
            </Modal>
        </>
    )
}

export default CreateSaleModal;
