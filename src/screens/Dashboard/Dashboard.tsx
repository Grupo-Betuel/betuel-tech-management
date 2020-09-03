import React from 'react';
import {Col, Row, FormGroup, Label, Input} from 'reactstrap';
import {MoneyStatisticLabel, Product} from '../../components';
import Logo from "../../assets/images/logo.png"
import "./Dashboard.scss";
import products from "../../model/products";
import {toast} from "react-toastify";

export interface ISale {
    price: number;
    profit: number;
    commission?: number;
    shipping?: number;
    productName: string;
};

export interface ISalesData {
    sales: ISale[];
}

export type ITotals = {
    [N in Exclude<keyof ISale, 'productName'>]: number;
}

const Dashboard: React.FunctionComponent<any> = () => {
    const [salesData, setSalesData] = React.useState<ISalesData>({} as any);
    const [salesTotals, setSalesTotals] = React.useState<ITotals>({} as any);
    const [tithe, setTithe] = React.useState(0);
    const [promotion, setPromotion] = React.useState(0);
    const tithePercent = 0.10;
    const promotionPercent = 0.30;

    const getSalesData = async () => {
        const response = await fetch(`${process.env.REACT_APP_API}get-sales-data`);
        const salesData: ISalesData = await response.json() as any;
        await setSalesData(salesData);
        return;
    };

    React.useEffect(() => {
        const getSales = async () => {
            await getSalesData();
        };
        getSales();
    }, []);


    const addSale = async (newSale: ISale) => {
        const sales = salesData.sales || [];
        const body = JSON.stringify({
            ...salesData,
            sales: [
                ...sales,
                newSale,
            ],
        });

        const response = await fetch(`${process.env.REACT_APP_API}save-sales-data`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body,
            }
        );

        if (response.status === 200) {
            await getSalesData();
            toast('¡Venta Exitosa!', { type: "default" });

        } else {
            toast('¡Error en la Venta!', { type: "error" });
        }
    };

    const setTotalOf = (key: keyof ISale) => {
        const total = getTotalSumFromSalesDataKey(key);
        setSalesTotals({
            ...salesTotals,
            [key]: total,
        })
    };

    const setAllDashboardTotals = () => {
        const newTotals: ITotals = {} as any;
        (Object.keys({shipping: 0, commission: 0, price: 0, profit: 0} as ITotals) as any)
            .forEach((key: keyof ITotals) => {
                const total = getTotalSumFromSalesDataKey(key);
                newTotals[key] = total;
            });
        setSalesTotals(newTotals);

        const tithe = newTotals.price * tithePercent;
        setTithe(tithe);
        const promotion = newTotals.profit * promotionPercent;
        setPromotion(promotion);
    };

    React.useEffect(() => {
        if (salesData.sales) setAllDashboardTotals();
    }, [salesData]);


    const getTotalSumFromSalesDataKey = (key: keyof ISale) =>
        salesData.sales.map((item: ISale) => !item[key] ? null : item[key] as any)
            .filter(item => !!item)
            .reduce((a: number, b: number) => a + b, 0);

    const getProductSales = (productName: string) => !salesData.sales ? 0 :
        salesData.sales.filter(sale => sale.productName === productName).length;

    const getProductMoney = (productName: string) => {
        if (!salesData.sales) return 0;
        const data = salesData.sales.filter(sale => sale.productName === productName);
        if(!data.length) return 0;
        const generated = data[0].profit * data.length;
        return generated;
    };

    return (
        <div
            className="d-flex align-items-center flex-column"
        >
            <Col lg={2} md={4} sm={4} className="p-4">
                <img src={Logo} alt="Logo AudSongs" className="w-100"/>
            </Col>
            <Col lg={10} md={10} sm={12} className="d-flex justify-content-center">
                <Row className="justify-content-center label-grid col-lg-10">
                    <MoneyStatisticLabel
                        label="Vendido"
                        amount={salesTotals.price}
                        className="total-label"
                    />
                    <MoneyStatisticLabel
                        label="Beneficio"
                        amount={salesTotals.profit}
                        className="total-label"
                    />
                    <MoneyStatisticLabel
                        label="Comisiones"
                        amount={salesTotals.commission}
                        className="total-label"
                    />
                    <MoneyStatisticLabel
                        label="Envios"
                        amount={salesTotals.shipping}
                        className="total-label"
                    />
                    <MoneyStatisticLabel
                        label="Promoción"
                        amount={promotion}
                        className="total-label"
                    />
                    <MoneyStatisticLabel
                        label="Diezmo"
                        amount={tithe}
                        className="total-label"
                    />

                </Row>
            </Col>
            <Col lg={8} md={10} sm={12} className="cards mt-3">
                {
                    products.map((item, i) =>
                        <Product
                            {...item}
                            salesQuantity={getProductSales(item.name)}
                            moneyGenerated={getProductMoney(item.name) as number}
                            addSale={addSale}
                            key={i}
                        />
                    )}
            </Col>
        </div>
    )
};

export default Dashboard;


// {/*<Col lg={10} md={12}>*/}
// {/*    <Row className="d-flex justify-content-center">*/}
// {/*        <Col*/}
// {/*            {...inputsSizes}*/}
// {/*        >*/}
// {/*            <FormGroup>*/}
// {/*                <Label for="priceInput">Precio</Label>*/}
// {/*                <Input type="number" name="price" id="priceInput"/>*/}
// {/*            </FormGroup>*/}
// {/*        </Col>*/}
// {/*        <Col*/}
// {/*            {...inputsSizes}*/}
// {/*        >*/}
// {/*            <FormGroup>*/}
// {/*                <Label for="profitInput">Beneficio</Label>*/}
// {/*                <Input type="number" name="profit" id="profitInput"/>*/}
// {/*            </FormGroup>*/}
// {/*        </Col>*/}
// {/*        <Col*/}
// {/*            {...inputsSizes}*/}
// {/*        >*/}
// {/*            <FormGroup>*/}
// {/*                <Label for="shippingInput">Precio de Envio</Label>*/}
// {/*                <Input type="number" name="shipping" id="shippingInput"/>*/}
// {/*            </FormGroup>*/}
// {/*        </Col>*/}
// {/*    </Row>*/}
// {/*</Col>*/}
