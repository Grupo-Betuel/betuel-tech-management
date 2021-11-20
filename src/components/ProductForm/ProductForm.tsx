import {
    Button,
    CustomInput, Form,
    FormGroup,
    Input,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
} from "reactstrap";
import React from "react";
import { IProductData } from "../../model/products";

export interface IProductFormProps {
    toggle: () => any;
    isOpen?: boolean;
    handleSubmit: (product: Partial<IProductData>) => any;
}

const ProductForm: React.FC<IProductFormProps> = (
    {
        isOpen,
        toggle,
        handleSubmit,
    }) => {
    const [product, setProduct] = React.useState<Partial<IProductData>>({});
    const [useCommission, setUseCommission] = React.useState(false);
    const [isSubmiting, setIsSubmiting] = React.useState(false);

    const useCommissionChange = (e: any) => {
        const {checked} = e.target;
        setUseCommission(checked);
    };

    const onChangeProduct = (ev: React.ChangeEvent<any>) => {
        const {name, value} = ev.target;
        const intValue = Number(value);
        const newProduct = {
            ...product,
            [name]: intValue
        };
        setProduct(newProduct);
    };

    const onSubmit = () => {
        handleSubmit(product)
    }

    return (

        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>{'New Product'}</ModalHeader>
            <Form onSubmit={onSubmit}>
                <ModalBody>
                    <FormGroup>
                        <Label for="priceId">Precio:</Label>
                        <Input onChange={onChangeProduct} type="number" name="price" id="priceId"
                               placeholder="Precio:" value={product.price}/>
                    </FormGroup>
                    {/*<FormGroup>*/}
                    {/*    <Label for="shippingId">Envio:</Label>*/}
                    {/*    <Input onChange={onChangeProduct} type="number" name="shipping" id="shippingId"*/}
                    {/*           placeholder="Envio:" value={product.shipping}/>*/}
                    {/*</FormGroup>*/}
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
                                       id="commissionId" placeholder="Comisión:" value={product.commission}/>
                            </FormGroup>
                    }
                </ModalBody>
                <ModalFooter>
                    <Button color={isSubmiting ? 'dark' : 'primary'} onClick={onSubmit}
                            disabled={isSubmiting}>Añadir</Button>{' '}
                    <Button color="secondary" onClick={toggle}>Cancel</Button>
                </ModalFooter>
            </Form>
        </Modal>
    )
}

export default ProductForm;
