import React from 'react';
import {
    Col,
    Row,
    FormGroup,
    Label,
    Input,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Spinner, CustomInput
} from 'reactstrap';
import { MoneyStatisticLabel, Product } from '../../components';
import Logo from "../../assets/images/logo.png"
import "./Dashboard.scss";
import products, { IProductData } from "../../model/products";
import { toast } from "react-toastify";
import TableComponent, { IAction, IHeader } from "../../components/Table/Table";

export interface ISale {
    id: number;
    productId: number;
    price: number;
    profit: number;
    commission?: number;
    shipping?: number;
    productName: string;
    cost: number;
};

export interface ISalesData {
    sales: ISale[];
}

export type ITotals = {
    [N in Exclude<keyof ISale, 'productName'>]: number;
}

export type IProductFilters = "MostProfit" | "MostSales";
const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const Dashboard: React.FunctionComponent<any> = () => {
    const [activeAddSaleModal, setActiveAddSaleModal] = React.useState(false);
    const [activeConfirmationModal, setActiveConfirmationModal] = React.useState(false);
    const [loadingApp, setLoadingApp] = React.useState(false);
    const [confirmationFunction, setConfirmationFunction] = React.useState<() => any>();
    const [useCommission, setUseCommission] = React.useState(false);
    const [addingSale, setAddingSale] = React.useState(false);
    const [productSalesActive, setProductSalesActive] = React.useState(false);
    const [productSales, setProductSales] = React.useState<ISale[]>([]);
    const [product, setProduct] = React.useState<IProductData>({} as any);
    const [salesData, setSalesData] = React.useState<ISalesData>({} as any);
    const [salesTotals, setSalesTotals] = React.useState<ITotals>({} as any);
    const [tithe, setTithe] = React.useState(0);
    const [promotion, setPromotion] = React.useState(0);
    const [registeredDates, setRegisteredDates] = React.useState<string[]>([]);
    const [filter, setFilter] = React.useState<IProductFilters>("MostProfit");
    const [recordedDate, setRecordedDate] = React.useState<string>(`${months[new Date().getMonth()]}-${new Date().getFullYear()}`);
    const tithePercent = 0.10;
    const promotionPercent = 0.30;

    const selectProduct = (product: IProductData) => {
        setProduct(product);
        setActiveAddSaleModal(true);
    };

    const getSalesData = (async (date?: string) => {
        setLoadingApp(true);
        const response = await fetch(`${process.env.REACT_APP_API}get-sales-data?date=${date || recordedDate}`);
        const salesData: ISalesData = await response.json() as any;
        setSalesData(salesData);
        setLoadingApp(false);

    });

    React.useEffect(() => {
        getSalesData();
        getAllRecordsDates();
    }, []);

    const newSale = async () => {
        const profit = product.price - product.cost;
        const sale: ISale = {
            id: new Date().getTime(),
            productId: product.id,
            price: product.price,
            profit: profit,
            cost: product.cost,
            productName: product.name,
            shipping: product.shipping || 0,
            commission: useCommission ? product.commission : 0,
        };

        await addSale(sale);
    };

    const onChangeProduct = (ev: React.ChangeEvent<any>) => {
        const { name, value } = ev.target;
        const intValue = Number(value);
        const newProduct = {
            ...product,
            [name]: intValue
        };
        setProduct(newProduct);
    };

    const addSale = async (newSale: ISale) => {
        setAddingSale(true);
        const sales = salesData.sales || [];
        const body = JSON.stringify({
            salesData: {
                ...salesData,
                sales: [
                    ...sales,
                    newSale,
                ],
            },
            date: recordedDate,
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
            toast('¡Venta Exitosa!', {type: "default"});

        } else {
            toast('¡Error en la Venta!', {type: "error"});
        }
        setAddingSale(false);

    };


    const getAllRecordsDates = async () => {
        const response = await fetch(`${process.env.REACT_APP_API}dates-registered`);
        const dates: string[] = await response.json() as any || [];

        const existActualDate = (dates as any).find((item: string) => item === recordedDate);
        if(!existActualDate) {
            dates.push(recordedDate);
        };

        setRegisteredDates(dates as any);
    }

    const updateSales = async (sales: ISale[]) => {
        setAddingSale(true);
        const body = JSON.stringify({
            salesData: {
                ...salesData,
                sales: [
                    ...sales,
                ],
            },
            date: recordedDate,
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
            toast('¡Registro actualizado Exitosamente!', {type: "default"});

        } else {
            toast('¡Error en la Actualizacion!', {type: "error"});
        }

        setAddingSale(false);
    };

    const setAllDashboardTotals = () => {
        const newTotals: ITotals = {} as any;
        (Object.keys({shipping: 0, commission: 0, price: 0, profit: 0} as ITotals) as any)
            .forEach((key: keyof ITotals) => {
                const total = getTotalSumFromSalesDataKey(key);
                newTotals[key] = total;
            });
        setSalesTotals(newTotals);

        const tithe = newTotals.profit * tithePercent;
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
        const totalSold = salesData.sales.filter(sale => sale.productName === productName)
            .map(item => item.profit).reduce((a,b) => a + b, 0);

        return totalSold;
    };

    const toggleAddSale = () => {
        setActiveAddSaleModal(!activeAddSaleModal);
        setProductSalesActive(false);
    };
    const useCommissionChange = (e: any) => {
        const {checked} = e.target;
        setUseCommission(checked);
    };


    const getAllSalesById = () => {
        if(salesData.sales) {
            const newProductSales = salesData.sales.filter((item, i) => item.productId === product.id);
            setProductSales([...newProductSales]);
            setProductSalesActive(true);
        }
    };

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


    const salesAction: IAction[] = [
        {
            label: 'Eliminar',
            method: (sale: ISale) => () => {
                toggleConfirmation();
                setConfirmationFunction(() => deleteSale(sale.id))
            },
        },
        {
            label: 'Editar',
            method: () => () => console.log('editando....'),
        },
    ];

    const toggleProductSales: any = (value?: boolean) => setProductSalesActive(!productSalesActive);

    const deleteSale = (saleId: number) => async () => {
        const sales = salesData.sales.filter( (item: ISale, i: number) => item.id !== saleId);
        setActiveConfirmationModal(false);

        await updateSales(sales);
        const productSales = sales.filter( item => item.productId === product.id);
        setProductSales([...productSales]);
    };

    const toggleConfirmation = () => setActiveConfirmationModal(!activeConfirmationModal);

    const mostProfitProducts = (sales: ISale[]): IProductData[] => {
        return products.sort((a: IProductData,b: IProductData) => {
            const aProfit = sales.map(sale => sale.productId === a.id ? sale.profit : undefined)
                .filter(item => !!item).reduce((a,b) => Number(a) + Number(b), 0);

            const bProfit = sales.map(sale => sale.productId === b.id ? sale.profit : undefined)
                .filter(item => !!item).reduce((a,b) => Number(a) + Number(b), 0);
            return Number(bProfit) - Number(aProfit);
        });
    }

    const mostSalesProducts = (sales: ISale[]): IProductData[] => {
        return products.sort((a: IProductData,b: IProductData) => {
            const aSales = sales.filter(sale => sale.productId === a.id).length;
            const bSales = sales.filter(sale => sale.productId === b.id).length;

            return Number(bSales) - Number(aSales);
        });
    }

    const filterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { checked }  = e.target;
        const filter: IProductFilters = checked ? 'MostSales' : 'MostProfit';
        setFilter(filter);
    };

    switch (filter) {
        case "MostProfit":
            mostProfitProducts(salesData.sales || []);
            break;
        case "MostSales":
            mostSalesProducts(salesData.sales || []);
            break;
        default:
            break;
    }

    const onChangeDateRegistered = async (ev: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = ev.target;
        setRecordedDate(value);
        getSalesData(value);

    }

    return (
        <>
            {
                !loadingApp ? null :
                    <div className="loading-sale-container">
                        <Spinner animation="grow" variant="secondary"/>
                    </div>
            }
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
                <ModalHeader toggle={toggleAddSale}>{product.name} | Nueva Venta</ModalHeader>
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
                            <Button color="primary" className="mb-3" type="button" onClick={toggleProductSales} >Crear Venta</Button>
                        <TableComponent data={productSales} headers={salesHeader} actions={salesAction} />
                        </>
                        :
                        <>
                            <FormGroup>
                                <Label for="priceId">Precio:</Label>
                                <Input onChange={onChangeProduct} type="number" name="price" id="priceId"
                                       placeholder="Precio:" value={product.price}/>
                            </FormGroup>
                            <FormGroup>
                                <Label for="shippingId">Envio:</Label>
                                <Input onChange={onChangeProduct} type="number" name="shipping" id="shippingId"
                                       placeholder="Envio:" value={product.shipping}/>
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
                                               id="commissionId" placeholder="Comisión:" value={product.commission}/>
                                    </FormGroup>
                            }
                            <Button color="primary" className="mt-3" onClick={getAllSalesById}>Todas las Ventas</Button>{' '}
                        </>
                    }


                </ModalBody>
                <ModalFooter>
                    <Button color={productSalesActive ? 'dark' : 'primary' } onClick={newSale} disabled={productSalesActive}>Añadir</Button>{' '}
                    <Button color="secondary" onClick={toggleAddSale} >Cancel</Button>
                </ModalFooter>
            </Modal>
            <div
                className="d-flex align-items-center flex-column"
            >
                <Col lg={2} md={4} sm={4} className="p-4">
                    <img src={Logo} alt="Logo AudSongs" className="w-100"/>
                </Col>
                <Col sm={12} className="d-flex justify-content-center mb-2">
                    <FormGroup>
                        <Input type="select" name="select" className="select-date" defaultValue={recordedDate} onChange={onChangeDateRegistered}>
                            { registeredDates ?
                                registeredDates
                                    .map( (item, i) => {
                                        const split = item.split("-");
                                        const selected = item===recordedDate;
                                        return <option selected={selected} key={i} value={item}>{split[0]}  {split[1]}</option>}
                                        )
                                :
                                <option> {months[new Date().getMonth()]} {new Date().getFullYear()}</option>
                            }


                        </Input>
                    </FormGroup>

                </Col>
                <Col sm={12} className="d-flex justify-content-center mb-4 align-items-center">
                    <label className="mr-2 mb-0">Más Ingresos</label>
                <CustomInput
                    type="switch"
                    label="Más Vendidos"
                    className="customize-switch"
                    onChange={filterChange}
                    />

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
                                onSelect={selectProduct}
                                salesQuantity={getProductSales(item.name)}
                                moneyGenerated={getProductMoney(item.name) as number}
                                addSale={addSale}
                                key={i}
                            />
                        )}
                </Col>
            </div>
        </>
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
