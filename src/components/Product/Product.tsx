import React, {ChangeEvent} from 'react';
import "./Product.scss";
import {IProductData} from "../../model/products";
import {Button, CustomInput, Input, Spinner} from "reactstrap";
import {ISale } from "../../screens/Dashboard/Dashboard";

export interface IProduct extends IProductData {
    addSale: (data: ISale) => any;
    salesQuantity?: number;
    moneyGenerated?: number;
    onSelect: (product: IProductData) => any;
}

export interface ISaleOptions {
    enableShipping: boolean;
    commission: boolean;
    inputShipping: boolean;
}

const Product: React.FunctionComponent<IProduct> = ({addSale, salesQuantity, moneyGenerated, onSelect, ...product}) => {

    const {image} = product;
    const defaultSaleOptions: ISaleOptions = {enableShipping: false, commission: false, inputShipping: false};
    const [saleOptions, setSaleOptions] = React.useState<ISaleOptions>(
        defaultSaleOptions
    );

    const [useShipping, setUseShipping] = React.useState(false);
    const [useComission, setUseCommission] = React.useState(false);
    const [shippingPrice, setShippingPrice] = React.useState();
    const [isLoading, setIsLoading] = React.useState(false);

    const toggleSaleOptions = (ev: any) => {
        const {id} = ev.target;
        setSaleOptions({
            ...defaultSaleOptions,
            [id]: true,
        })
    };

    const shippingOnChange = (e: ChangeEvent<HTMLInputElement>) => {
        const {checked} = e.target;
        setUseShipping(checked);
    };

    const commissionOnChange = (e: ChangeEvent<HTMLInputElement>) => {
        const {checked} = e.target;
        setUseCommission(checked);
    };

    const shippingPriceOnChange = (e: ChangeEvent<HTMLInputElement>) => {
        const {value} = e.target;

        setShippingPrice(value ? Number(value) : value);
    };

    const resetSaleOptions = () => {
        setUseCommission(false);
        setUseShipping(false);
        setSaleOptions(defaultSaleOptions);
    };

    const newSale = async () => {
        const profit = product.price - product.cost;
        const sale: ISale = {
            id: new Date().getTime(),
            productId: product.id,
            price: product.price,
            cost: product.cost,
            profit: profit,
            productName: product.name,
        };

        if (useShipping) {
            sale.shipping = shippingPrice;
        }
        if (useComission) {
            sale.commission = product.commission;
        }

        resetSaleOptions();
        setIsLoading(true);

        await addSale(sale);

        setIsLoading(false);
    };

    const onSelectProduct = () => {
        onSelect(product);
    };

    return (
        <div className="card" onClick={onSelectProduct}>
            <div
                className="card-content"
            >
                <div className="card-image-container overflow-hidden">
                    <div
                        className="card-image"
                        style={{
                            backgroundImage:
                                `url('${image}')`
                        }}
                    >
                    </div>
                    <div className="add-sale-container">
                        <b className="reset-sale" onClick={resetSaleOptions}>X</b>
                        {
                            saleOptions.commission || saleOptions.enableShipping || saleOptions.inputShipping ? null :
                                <Button type="button" id="enableShipping" onClick={toggleSaleOptions}>
                                    Añadir Venta
                                </Button>
                        }
                        {
                            !saleOptions.enableShipping ? null :
                                <>
                                    <CustomInput
                                        type="switch"
                                        label="¿Incluye envio?"
                                        className="customized-switch"
                                        onChange={shippingOnChange}/>
                                    <Button className="mt-3" id={useShipping ? "inputShipping" : "commission"}
                                            onClick={toggleSaleOptions}>Continuar</Button>
                                </>
                        }
                        {
                            !saleOptions.inputShipping ? null :
                                <>
                                    <Input placeholder="Precio de Envio" name="shipping" type="number"
                                           className="shipping-input" value={shippingPrice}
                                           onChange={shippingPriceOnChange}/>
                                    <Button className="mt-3" id="commission"
                                            onClick={toggleSaleOptions}>Continuar</Button>
                                </>
                        }

                        {
                            !saleOptions.commission ? null :
                                <>
                                    <CustomInput
                                        type="switch"
                                        label="¿Incluye comisión?"
                                        className="customized-switch"
                                        onChange={commissionOnChange}/>
                                    <Button className="mt-3" onClick={newSale}>Fin</Button>
                                </>
                        }

                        {
                            !isLoading ? null :
                                    <Spinner animation="grow" variant="secondary"/>
                        }
                    </div>
                </div>

                <div className="card-title">
                    <div className="title">
                        <h4>Ventas: {salesQuantity}</h4>
                        <h4>Ingresos: RD$ {moneyGenerated && moneyGenerated.toLocaleString('en-US')}</h4>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default Product;
