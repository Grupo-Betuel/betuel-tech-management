import React, { ChangeEvent } from 'react';
import "./Product.scss";
import { IProductData } from "../../model/products";
import { Button } from "reactstrap";
import { ISale } from "../../model/interfaces/SalesModel";

export interface IProduct extends IProductData {
    salesQuantity?: number;
    moneyGenerated?: number;
    loadSale: (product: IProductData) => any;
    loadProductDetails: (product: IProductData) => any;
    selected?: boolean;
    portfolioMode?: boolean;
    enableSelection?: boolean;
    onSelect?: (product: IProductData) => any;
}

export interface ISaleOptions {
    enableShipping: boolean;
    commission: boolean;
    inputShipping: boolean;
}

const Product: React.FunctionComponent<IProduct> = ({
                                                        portfolioMode,
                                                        salesQuantity,
                                                        onSelect,
                                                        enableSelection,
                                                        moneyGenerated,
                                                        loadSale,
                                                        loadProductDetails,
                                                        selected,
                                                        ...product
                                                    }) => {

    const {image} = product;
    const defaultSaleOptions: ISaleOptions = {enableShipping: false, commission: false, inputShipping: false};
    const [saleOptions, setSaleOptions] = React.useState<ISaleOptions>(
        defaultSaleOptions
    );

    const [useShipping, setUseShipping] = React.useState(false);
    const [useComission, setUseCommission] = React.useState(false);
    const [enableProductOptions, setEnableProductOptions] = React.useState(false);
    const [shippingPrice, setShippingPrice] = React.useState<any>();
    const [isLoading, setIsLoading] = React.useState(false);

    React.useEffect(() => setEnableProductOptions(false), [enableSelection])
    const handleSelectProduct = () => {
        if (enableSelection) {
            onSelect && onSelect(product)
        } else {
            setEnableProductOptions(!enableProductOptions);
        }
    }


    const resetSaleOptions = () => {
        setUseCommission(false);
        setUseShipping(false);
        setSaleOptions(defaultSaleOptions);
    };

    const newSale = async () => {
        const profit = product.price - product.cost;
        const sale: ISale = {
            productId: product._id,
            price: product.price,
            cost: product.cost,
            profit: profit,
            productName: product.name,

        } as any;

        if (useShipping) {
            sale.shipping = shippingPrice;
        }
        if (useComission) {
            sale.commission = product.commission;
        }

        resetSaleOptions();
        setIsLoading(true);

        // await addSale(sale);

        setIsLoading(false);
    };

    const handleLoadSale = () => {
        loadSale(product);
    };

    const handleLoadProduct = () => {
        loadProductDetails(product);
    };

    return (
        <div className={`card ${selected ? 'selected' : ''}`}>
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
                    <div className={`add-sale-container ${enableProductOptions ? 'no-opacity' : ''}`}
                         onClick={portfolioMode ?  handleLoadProduct : handleSelectProduct}>
                        {/*<b className="reset-sale" onClick={resetSaleOptions}>X</b>*/}
                        {
                            <>
                                <Button color="success" type="button" className="mb-3" id="enableShipping" outline
                                        onClick={handleLoadSale}>
                                    Añadir Venta
                                </Button>
                                <Button color="primary" type="button" className="mb-3" id="enableShipping" outline
                                        onClick={handleLoadProduct}>
                                    Ver Producto
                                </Button>
                            </>

                        }

                    </div>
                </div>

                {
                    !portfolioMode &&
                    <div className="card-title">
                      <div className="title">
                        <h4>Disponible: {product.stock}</h4>
                        <h4>Precio: {product.price.toLocaleString()}</h4>
                        <h4>Ventas: {salesQuantity}</h4>
                        <h4>Ingresos: RD$ {moneyGenerated && moneyGenerated.toLocaleString('en-US')}</h4>
                      </div>
                    </div>}
            </div>
        </div>
    )
};

export default Product;
