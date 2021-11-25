import React from 'react';
import {
    Col,
    Row,
    FormGroup,
    Input,
    Spinner, CustomInput, Modal
} from 'reactstrap';
import { MoneyStatisticLabel, Product } from '../../components';
import Logo from "../../assets/images/logo.png"
import "./Dashboard.scss";
import { IProductData } from "../../model/products";
import { toast } from "react-toastify";
import { addSales, deleteSale, getRecordedDates, getSales, updateSales } from "../../services/sales";
import { ISale } from "../../model/interfaces/SalesModel";
import CreateSaleModal from "../../components/CreateSaleModal/CreateSaleModal";
import styled from "styled-components";
import ProductForm, { IProductImageProperties } from "../../components/ProductForm/ProductForm";
import { addProduct, getProducts } from "../../services/products";

const CreateNewProductButton = styled.button`
    position: fixed;
    bottom: 30px;
    right: 30px;
    border-radius: 50%;
    height: 70px;
    width: 70px;
    background-color: #fff;
    z-index: 999;
    padding: 0;
        i {
          font-size: 30px;
        }
`
export type ITotals = {
    [N in Exclude<keyof ISale, 'productName'>]: number;
}

export type IProductFilters = "MostProfit" | "MostSales";
const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const Dashboard: React.FunctionComponent<any> = () => {
    const [activeAddSaleModal, setActiveAddSaleModal] = React.useState(false);
    const [activeConfirmationModal, setActiveConfirmationModal] = React.useState(false);
    const [loadingApp, setLoadingApp] = React.useState(false);
    const [useCommission, setUseCommission] = React.useState(false);
    const [addingSale, setAddingSale] = React.useState(false);
    const [productSalesActive, setProductSalesActive] = React.useState(false);
    const [productFormIsOpen, setProductFormIsOpen] = React.useState(false);
    const [productSales, setProductSales] = React.useState<ISale[]>([]);
    const [sale, setSale] = React.useState<Partial<ISale>>({});
    const [salesData, setSalesData] = React.useState<ISale[]>([]);
    const [salesTotals, setSalesTotals] = React.useState<ITotals>({} as any);
    const [tithe, setTithe] = React.useState(0);
    const [promotion, setPromotion] = React.useState(0);
    const [registeredDates, setRegisteredDates] = React.useState<string[]>([]);
    const [products, setProducts] = React.useState<IProductData[]>([]);
    const [filter, setFilter] = React.useState<IProductFilters>("MostProfit");
    const [recordedDate, setRecordedDate] = React.useState<string>(`${months[new Date().getMonth()]}-${new Date().getFullYear()}`);
    const tithePercent = 0.10;
    const promotionPercent = 0.30;

    const toggleProductForm = () => setProductFormIsOpen(!productFormIsOpen);

    const selectProduct = (product: IProductData) => {
        const profit = product.price - product.cost;

        const sale: Partial<ISale> = {
            profit,
            productId: product._id,
            price: product.price,
            cost: product.cost,
            productName: product.name,
            shipping: 0,
            commission: useCommission ? product.commission : 0,
            date: recordedDate,
        };

        setSale(sale);
        setActiveAddSaleModal(true);
    };

    const getSalesData = (async (date?: string) => {
        setLoadingApp(true);
        const salesData = await getSales(date || recordedDate);
        setSalesData(salesData);
        setLoadingApp(false);
    });

    const getAllProducts = async () => {
        setLoadingApp(true);
        const products = await getProducts();
        setProducts(products);
        setLoadingApp(false);
    }

    React.useEffect(() => {
        getSalesData();
        getAllRecordsDates();
        getAllProducts();
    }, []);

    const newSale = async () => {
        await handleAddSale(sale);
    };

    const onChangeSaleDetails = (ev: React.ChangeEvent<any>) => {
        const {name, value} = ev.target;
        const intValue = Number(value);
        const newSale = {
            ...sale,
            [name]: intValue
        };
        setSale(newSale);
    };

    const handleAddSale = async (newSale: Partial<ISale>) => {
        setAddingSale(true);
        const body = JSON.stringify(newSale);

        const response = await addSales(body);

        if (response.status === 201) {
            await getSalesData();
            toast('¡Venta Exitosa!', {type: "default"});

        } else {
            toast('¡Error en la Venta!', {type: "error"});
        }
        setAddingSale(false);

    };


    const getAllRecordsDates = async () => {
        const dates: string[] = await getRecordedDates();
        const existActualDate = (dates as any).find((item: string) => item === recordedDate);
        if (!existActualDate) {
            dates.push(recordedDate);
        }
        ;

        setRegisteredDates(dates as any);
    }

    const handleDeleteSale = async (_id: number) => {
        const sales = salesData.filter((item: ISale, i: number) => item._id !== _id);
        setActiveConfirmationModal(false);

        setAddingSale(true);

        const response = await deleteSale(JSON.stringify({_id}));
        if (response.status === 204) {
            await getSalesData();
            toast('¡Registro Eliminado Exitosamente!', {type: "default"});
            const productSales = sales.filter(item => item.productId === sale._id);
            setProductSales([...productSales]);
        } else {
            toast('¡Error al eliminar!', {type: "error"});
        }

        setAddingSale(false);
    };

    const handleUpdateSale = async (sales: ISale[]) => {
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

        const response = await updateSales(body);
        if (response.status === 200) {
            await getSalesData();
            toast('¡Registro Eliminado Exitosamente!', {type: "default"});

        } else {
            toast('¡Error al eliminar!', {type: "error"});
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
        if (salesData) setAllDashboardTotals();
    }, [salesData]);


    const getTotalSumFromSalesDataKey = (key: keyof ISale) =>
        salesData.map((item: ISale) => !item[key] ? null : item[key] as any)
            .filter(item => !!item)
            .reduce((a: number, b: number) => a + b, 0);

    const getProductSales = (productName: string) => !salesData ? 0 :
        salesData.filter(sale => sale.productName === productName).length;

    const getProductMoney = (productName: string) => {
        if (!salesData) return 0;
        const totalSold = salesData.filter(sale => sale.productName === productName)
            .map(item => item.profit).reduce((a, b) => a + b, 0);

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
        if (salesData) {
            const newProductSales = salesData.filter((item, i) => item.productId === sale._id);
            setProductSales([...newProductSales]);
            setProductSalesActive(true);
        }
    };


    const toggleProductSales: any = (value?: boolean) => setProductSalesActive(!productSalesActive);

    const toggleConfirmation = () => setActiveConfirmationModal(!activeConfirmationModal);

    const mostProfitProducts = (sales: ISale[]): IProductData[] => {
        return products.sort((a: IProductData, b: IProductData) => {
            const aProfit = sales.map(sale => sale.productId === a._id ? sale.profit : undefined)
                .filter(item => !!item).reduce((a, b) => Number(a) + Number(b), 0);

            const bProfit = sales.map(sale => sale.productId === b._id ? sale.profit : undefined)
                .filter(item => !!item).reduce((a, b) => Number(a) + Number(b), 0);
            return Number(bProfit) - Number(aProfit);
        });
    }

    const mostSalesProducts = (sales: ISale[]): IProductData[] => {
        return products.sort((a: IProductData, b: IProductData) => {
            const aSales = sales.filter(sale => sale.productId === a._id).length;
            const bSales = sales.filter(sale => sale.productId === b._id).length;

            return Number(bSales) - Number(aSales);
        });
    }

    const filterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {checked} = e.target;
        const filter: IProductFilters = checked ? 'MostSales' : 'MostProfit';
        setFilter(filter);
    };

    switch (filter) {
        case "MostProfit":
            mostProfitProducts(salesData || []);
            break;
        case "MostSales":
            mostSalesProducts(salesData || []);
            break;
        default:
            break;
    }

    const onChangeDateRegistered = async (ev: React.ChangeEvent<HTMLInputElement>) => {
        const {value} = ev.target;
        setRecordedDate(value);
        getSalesData(value);
    }

    return (
        <>
            {
                !loadingApp ? null :
                    <>
                        <div className="loading-sale-container">
                            <Spinner animation="grow" variant="secondary"/>
                        </div>
                    </>
            }
            <CreateSaleModal
                activeAddSaleModal={activeAddSaleModal}
                toggleAddSale={toggleAddSale}
                sale={sale as any}
                toggleProductSales={toggleProductSales}
                productSalesActive={productSalesActive}
                productSales={productSales}
                addingSale={addingSale}
                handleDeleteSale={handleDeleteSale}
                onChangeProduct={onChangeSaleDetails}
                useCommission={useCommission}
                useCommissionChange={useCommissionChange}
                getAllSalesById={getAllSalesById}
                newSale={newSale}
            />
            <div
                className="d-flex align-items-center flex-column"
            >
                <Col lg={2} md={4} sm={4} className="p-4">
                    <img src={Logo} alt="Logo AudSongs" className="w-100"/>
                </Col>
                <Col sm={12} className="d-flex justify-content-center mb-2">
                    <FormGroup>
                        <Input type="select" name="select" className="select-date" defaultValue={recordedDate}
                               onChange={onChangeDateRegistered}>
                            {registeredDates ?
                                registeredDates
                                    .map((item, i) => {
                                            const split = item.split("-");
                                            const selected = item === recordedDate;
                                            return <option selected={selected} key={i}
                                                           value={item}>{split[0]} {split[1]}</option>
                                        }
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
                                addSale={handleAddSale}
                                key={i}
                            />
                        )}
                </Col>
            </div>
            <CreateNewProductButton className="btn btn-outline-danger" onClick={toggleProductForm}>
                <i className="bi-plus"/>
            </CreateNewProductButton>

            <ProductForm
                loadProducts={getAllProducts}
                isOpen={productFormIsOpen}
                         toggle={toggleProductForm}/>
        </>
    )
};

export default Dashboard;
