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
import React from "react";
import { ISale } from "../../model/interfaces/SalesModel";
import { addSales } from "../../services/sales";
import { toast } from "react-toastify";
import { IProductData } from "../../model/products";

export interface ICreateSaleModal {
    activeAddSaleModal?: boolean;
    toggleAddSale: () => any;
    sale: ISale;
    toggleProductSales: () => any;
    productSalesActive?: boolean;
    productSales: ISale[];
    addingSale?: boolean;
    handleDeleteSale: (_id: number) => Promise<any>;
    onChangeProduct: (e: React.ChangeEvent<HTMLInputElement>) => any;
    useCommission?: boolean;
    useCommissionChange: (e: React.ChangeEvent<HTMLInputElement>) => any;
    getAllSalesById: () => any;
    newSale: () => any;
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
        sale,
        toggleProductSales,
        productSalesActive,
        productSales,
        addingSale,
        handleDeleteSale,
        onChangeProduct,
        useCommission,
        useCommissionChange,
        getAllSalesById,
        newSale
    }) => {
    const [confirmationFunction, setConfirmationFunction] = React.useState<() => any>();
    const [activeConfirmationModal, setActiveConfirmationModal] = React.useState(false);
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
            <Modal isOpen={activeAddSaleModal} toggle={toggleAddSale}>
                <ModalHeader toggle={toggleAddSale}>{sale.productName} | Nueva Venta</ModalHeader>
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
                            <Button color="primary" className="mb-3" type="button" onClick={toggleProductSales}>Crear
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
                            <Button color="primary" className="mt-3" onClick={getAllSalesById}>Todas las
                                Ventas</Button>{' '}
                        </>
                    }


                </ModalBody>
                <ModalFooter>
                    <Button color={productSalesActive ? 'dark' : 'primary'} onClick={newSale}
                            disabled={productSalesActive}>Añadir</Button>{' '}
                    <Button color="secondary" onClick={toggleAddSale}>Cancel</Button>
                </ModalFooter>
            </Modal>
        </>
    )
}

export default CreateSaleModal;
