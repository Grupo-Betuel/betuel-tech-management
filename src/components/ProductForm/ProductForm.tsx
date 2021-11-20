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


export interface ICalculatedPrice {
    price: number;
    wholeSale: string;
}
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
        const {name, value, type } = ev.target;
        const finalValue = type === "number" ?  Number(value) : value ;
        let priceData = {};
        // setting price values when cost is added
        if(name === 'cost') {
            priceData = calculatePrice(Number(value));
        }
        const newProduct = {
            ...product,
            ...priceData,
            [name]: finalValue
        };
        setProduct(newProduct);

    };

    const onSubmit = () => {
        handleSubmit(product);
    }

    const calculatePrice = (cost: number): ICalculatedPrice =>  {
        let value = cost || product.cost || 0;
        let price = value;
        let wholeSale: any = {
            three: value,
            six: value,
            ten: value
        };

        if (value <= 450) {
            price = value + (value * 0.90);
            wholeSale.three = value + (value * 0.40);
            wholeSale.six = value + (value * 0.30);
            wholeSale.ten = value + (value * 0.20);
        }

        if (value >= 450) {
            price = value + (value * 0.80);
            wholeSale.three = value + (value * 0.30);
            wholeSale.six = value + (value * 0.20);
            wholeSale.ten = value + (value * 0.15);
        }
        if (value >= 1000) {
            price = value + (value * 0.70);

        }
        if (value >= 2000) {
            price = value + (value * 0.60);

        }

        if (value >= 2500) {
            price = value + (value * 0.40);
            wholeSale.three = value + (value * 0.18);
            wholeSale.six = value + (value * 0.10);
            wholeSale.ten = value + (value * 0.5);
        }

        if (value >= 3600) {
            price = value + (value * 0.35);

        }

        /// filling wholesales values with two decimals values
        Object.keys(wholeSale).forEach((key: string) =>
            wholeSale[key] = processPrice(Math.ceil(wholeSale[key])));
        return {
            price: processPrice(Math.ceil(price)),
            wholeSale: JSON.stringify(wholeSale),
        }
    }

    const processPrice = (price: number) => {
        const internationalNumberFormat = new Intl.NumberFormat('en-US')

        const completeprice = internationalNumberFormat.format(price);
        const dividedPrice = completeprice.split(',');
        let pricePiece: any = dividedPrice[1] || dividedPrice[0];
        const lastTwo = Number(pricePiece.substring(pricePiece.length - 2));
        if(lastTwo > 50) {
            pricePiece = Number((Number(pricePiece.charAt(0)) + 1 ) + '00') - 5;
        } else {
            pricePiece = Number(pricePiece.charAt(0)+ '48');
        }

        if(dividedPrice[1]) {
            dividedPrice[1] = pricePiece;
        } else {
            dividedPrice[0] = pricePiece;
        }

        return Number(dividedPrice.join(''));
    }
    return (

        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>{'New Product'}</ModalHeader>
            <Form onSubmit={onSubmit}>
                <ModalBody>
                    <FormGroup>
                        <Label for="name">Nombre:</Label>
                        <Input onChange={onChangeProduct} name="name" id="name"
                               value={product.name}/>
                    </FormGroup>
                    <FormGroup>
                        <Label for="cost">Costo:</Label>
                        <Input onChange={onChangeProduct} type="number" name="cost" id="cost"
                               value={product.cost}/>
                    </FormGroup>
                    <FormGroup>
                        <Label for="priceId">Precio:</Label>
                        <Input disabled={!product.cost} onChange={onChangeProduct} type="number" name="price" id="priceId"
                               value={product.cost ? product.price : 0}/>
                    </FormGroup>

                    {/*<FormGroup>*/}
                    {/*    <Label for="shippingId">Envio:</Label>*/}
                    {/*    <Input onChange={onChangeProduct} type="number" name="shipping" id="shippingId"*/}
                    {/*           placeholder="Envio:" value={product.shipping}/>*/}
                    {/*</FormGroup>*/}
                    <>
                        <CustomInput
                            type="switch"
                            label="¿Agregar Comisión Manualmente?"
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
