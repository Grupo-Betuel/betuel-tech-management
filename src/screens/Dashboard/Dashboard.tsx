import React from 'react';
import {
    Col,
    Row,
    FormGroup,
    Input,
    Spinner, CustomInput, Label
} from 'reactstrap';
import { MoneyStatisticLabel, Product } from '../../components';
import Logo from "../../assets/images/logo.png"
import CorotosFavicon from "../../assets/images/corotos-favicon.png"
import FleaFavicon from "../../assets/images/flea-favicon.png"
import "./Dashboard.scss";
import { IProductData } from "../../model/products";
import { getRecordedDates, getSales } from "../../services/sales";
import { ISale } from "../../model/interfaces/SalesModel";
import CreateSaleModal from "../../components/CreateSaleModal/CreateSaleModal";
import styled from "styled-components";
import ProductForm from "../../components/ProductForm/ProductForm";
import { getProducts } from "../../services/products";
import { ecommerceNames, ECommerceTypes, promoteProduct } from "../../services/promotions";
import { IProduct } from "../../components/Product/Product";
import { toast } from "react-toastify";
import { useHistory } from "react-router";

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
export const LogOutButton = styled(CreateNewProductButton)`
  position: absolute;
  top: 15px;
  bottom: unset;
`

export const PromotionOption: any = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;

  .loading-spinner {
    display: ${(props: any) => props.loading ? 'block' : 'none'};
    position: absolute;
    height: 30px;
    width: 30px;
  }
`
export type ITotals = {
    [N in Exclude<keyof ISale, 'productName'>]: number;
}

export type IProductFilters = "MostProfit" | "MostSales";
const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const Dashboard: React.FunctionComponent<any> = ({setToken, portfolioMode}) => {
    const [activeAddSaleModal, setActiveAddSaleModal] = React.useState(false);
    const [activeConfirmationModal, setActiveConfirmationModal] = React.useState(false);
    const [loadingApp, setLoadingApp] = React.useState(false);
    const [productFormIsOpen, setProductFormIsOpen] = React.useState(false);
    const [promotionLoading, setPromotionLoading] = React.useState<{ [N in ECommerceTypes]?: boolean }>({});
    const [enableSelection, setEnableSelection] = React.useState(false);
    const [editSale, setEditSale] = React.useState<ISale>({} as any);
    const [salesData, setSalesData] = React.useState<ISale[]>([]);
    const [salesTotals, setSalesTotals] = React.useState<ITotals>({} as any);
    const [tithe, setTithe] = React.useState(0);
    const [promotion, setPromotion] = React.useState(0);
    const [registeredDates, setRegisteredDates] = React.useState<string[]>([]);
    const [products, setProducts] = React.useState<IProductData[]>([]);
    const [selections, setSelections] = React.useState<IProductData[]>([]);
    const [filter, setFilter] = React.useState<IProductFilters>("MostProfit");
    const [editProduct, setEditProduct] = React.useState<Partial<IProductData>>(null as any);
    const [recordedDate, setRecordedDate] = React.useState<string>(`${months[new Date().getMonth()]}-${new Date().getFullYear()}`);
    const tithePercent = 0.10;
    const promotionPercent = 0.30;
    const history = useHistory();

    const toggleProductForm = () => {
        setEditProduct(null as any);
        setProductFormIsOpen(!productFormIsOpen);
    }


    const loadProductDetails = (product: Partial<IProductData>) => {
        setEditProduct(product);
        setProductFormIsOpen(true)
    }
    const onSelectProduct = (product: IProductData) => {
        if (enableSelection) {
            if (selections.find(prod => prod._id === product._id)) {
                setSelections(selections.filter(prod => prod._id !== product._id));
            } else {
                if (selections.length < 5) {
                    setSelections([...selections, product]);
                } else {
                    toast('¡Hey! Solo puedes seleccionar 5 articulos', {type: 'info'});
                }
            }
            return;

        }
    }
    const selectProduct = (product: IProductData) => {
        const profit = product.price - product.cost;

        const sale: Partial<ISale> = {
            profit,
            productId: product._id,
            price: product.price,
            cost: product.cost,
            productName: product.name,
            shipping: 0,
            commission: product.commission,
            date: recordedDate,
        };

        setEditSale(sale as any);
        setActiveAddSaleModal(true);
    };

    const getSalesData = async (date?: string) => {
        setLoadingApp(true);
        const salesData = await getSales(date || recordedDate);
        setSalesData(salesData);
        setLoadingApp(false);
    };

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

    const getAllRecordsDates = async () => {
        const dates: string[] = await getRecordedDates();
        const existActualDate = (dates as any).find((item: string) => item === recordedDate);
        if (!existActualDate) {
            dates.push(recordedDate);
        }
        ;

        setRegisteredDates(dates as any);
    }

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

    const getProductSales = (productId: string) => !salesData ? 0 :
        salesData.filter(sale => sale.productId === productId).length;

    const getProductMoney = (productId: string) => {
        if (!salesData) return 0;
        const totalSold = salesData.filter(sale => sale.productId === productId)
            .map(item => item.profit).reduce((a, b) => a + b, 0);

        return totalSold;
    };

    const toggleAddSale = () => {
        setActiveAddSaleModal(!activeAddSaleModal);
    };


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

    const toggleEnableSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {checked} = e.target;
        setEnableSelection(checked);
        if (!checked) {
            setSelections([]);
        }
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

    const handlePromoteProduct = (ecommerceType: ECommerceTypes, data: Partial<IProductData>[] = selections) => async () => {
        // do nothing while loading or selection mode isn't active
        if ((data.length > 1 && !enableSelection) || promotionLoading[ecommerceType]) {
            return;
        }
        try {
            if (data.length <= 0) {
                toast('¡Hey! Tienes que seleccionar almenos un producto para promocionar.', {type: 'error'});
                return;
            }
            setPromotionLoading((data) => ({
                ...data,
                [ecommerceType]: true
            }))
            toast(`Los productos terminarán de publicarse en ${ecommerceNames[ecommerceType]} pronto...`,
                { type: 'default', autoClose: 45000 * data.length, pauseOnHover: false, closeButton: false, pauseOnFocusLoss: false })
            const response: any = {}
            setPromotionLoading((data) => ({
                ...data,
                [ecommerceType]: false
            }))

            if (!response.success) {
                toast(`Error al Promocionar en ${ecommerceNames[ecommerceType]}: ${response.error}`, {type: "error"});
            } else {
                toast(`¡Excelente! ¡Ya se publicaron los productos en ${ecommerceNames[ecommerceType]}!`, {
                    type: "success",
                });
            }
        } catch (err) {
            console.error('promotion error: ', err);
            setPromotionLoading((data) => ({
                ...data,
                [ecommerceType]: false
            }))
        }


    }

    const logOut = () => {
        localStorage.setItem('authToken', '');
        setToken('');
    }

    const togglePortfolioDashboard = () => {
        if(portfolioMode) {
            history.push('/dashboard');
        } else {
            history.push('/portfolio');
        }
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
                selectedSale={editSale}
                salesData={salesData}
                getSalesData={getSalesData}
            />
            <div
                className="d-flex align-items-center flex-column"
            >
                {localStorage.getItem('authToken') && <Col sm={8} className="position-relative">
                    <LogOutButton className="btn btn-outline-danger" title="Salir" onClick={logOut}>
                        <i className="bi bi-box-arrow-right"/>
                    </LogOutButton>
                    <LogOutButton className="btn btn-outline-danger go-to-portfolio" title={`Ir al ${portfolioMode ? 'Dashboard' : 'al Portafolio'}`} onClick={togglePortfolioDashboard}>
                        <i className={`bi ${ portfolioMode ? 'bi-skip-backward-fill' : 'bi-skip-forward-fill' } `}/>
                    </LogOutButton>
                </Col>}
                <Col lg={2} md={4} sm={4} className="p-4">
                    <img src={Logo} alt="Logo AudSongs" className="w-100"/>
                </Col>
                {!portfolioMode && <>
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
                  <div
                    className="d-flex justify-content-center mb-4 align-items-center justify-content-around col-sm-12 col-md-10 col-lg-10">
                    <div>
                      <Label className="d-flex flex-column align-items-center cursor-pointer">
                        <CustomInput
                          type="switch"
                          className="customize-switch enable-selection-switch d-block"
                          onChange={toggleEnableSelection}
                        />
                        <span>Habilitar Selection</span>
                      </Label>
                    </div>
                    <div className="d-flex align-items-center">
                      <label className="mr-2 mb-0">Más Ingresos</label>
                      <CustomInput
                        type="switch"
                        label="Más Vendidos"
                        className="customize-switch"
                        onChange={filterChange}
                      />
                    </div>
                    <div className={`d-flex align-items-center ${!enableSelection ? 'disable-promotions' : ''}`}>
                      <PromotionOption loading={promotionLoading.facebook}>
                        <Spinner className="loading-spinner" animation="grow" variant="secondary" size="sm"/>
                        <i data-toggle="tooltip"
                           title="Publicar Seleccionados en Facebook Marketplace"
                           className="bi bi-facebook text-info cursor-pointer promotion-icon facebook-icon"
                           onClick={handlePromoteProduct('facebook')}
                        />
                      </PromotionOption>
                      <PromotionOption loading={promotionLoading.flea}>
                        <Spinner className="loading-spinner" animation="grow" variant="secondary" size="sm"/>
                        <img
                          src={FleaFavicon}
                          data-toggle="tooltip"
                          title="Publicar Seleccionados en La Pulga"
                          className="text-info cursor-pointer promotion-icon img-promotion-icon"
                          onClick={handlePromoteProduct('flea')}
                        />
                      </PromotionOption>
                      <PromotionOption loading={promotionLoading.corotos}>
                        <Spinner className="loading-spinner" animation="grow" variant="secondary" size="sm"/>
                        <img
                          src={CorotosFavicon}
                          data-toggle="tooltip"
                          title="Publicar Seleccionados en Corotos"
                          className="text-info cursor-pointer promotion-icon img-promotion-icon"
                          onClick={handlePromoteProduct('corotos')}
                        />
                      </PromotionOption>
                    </div>

                  </div>

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
                </>}
                <Col lg={8} md={10} sm={12} className={`cards mt-3 ${enableSelection ? 'cards-shrink' : ''}`}>
                    {
                        products.map((item, i) =>
                            <Product
                                {...item}
                                portfolioMode={portfolioMode}
                                selected={!!selections.find(prod => prod._id === item._id)}
                                onSelect={onSelectProduct}
                                enableSelection={enableSelection}
                                loadSale={selectProduct}
                                loadProductDetails={loadProductDetails}
                                salesQuantity={getProductSales(item._id)}
                                moneyGenerated={getProductMoney(item._id) as number}
                                key={i}
                            />
                        )}
                </Col>
            </div>

            {!portfolioMode && <CreateNewProductButton className="btn btn-outline-danger" onClick={toggleProductForm}>
              <i className="bi-plus"/>
            </CreateNewProductButton>}

            <ProductForm
                portfolioMode={portfolioMode}
                handlePromoteProduct={handlePromoteProduct}
                promotionLoading={promotionLoading}
                loadProducts={getAllProducts}
                isOpen={productFormIsOpen}
                toggle={toggleProductForm}
                editProduct={editProduct}/>
        </>
    )
};

export default Dashboard;
