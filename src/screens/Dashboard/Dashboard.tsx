import React, {useEffect, useState} from "react";
import {
    Col,
    Row,
    FormGroup,
    Input,
    Spinner,
    Label,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button, DropdownToggle, Dropdown, DropdownMenu, DropdownItem
} from "reactstrap";
import {StatisticLabel, Product} from "../../components";
import BetuelTechLogo from "../../assets/images/betueltech.png";
import BetuelDanceLogo from "../../assets/images/betueldance/logo.png";
import BetuelTravelLogo from "../../assets/images/betueltravel.png";
import DixyBabyLogo from "../../assets/images/dixybaby.jpeg";
import CorotosFavicon from "../../assets/images/corotos-favicon.png";
import FleaFavicon from "../../assets/images/flea-favicon.png";
import "./Dashboard.scss";
import {IProductData, IProductParam} from "../../models/productModels";
import {getRecordedDates, getSales} from "../../services/sales";
import {ISale} from "../../models/interfaces/SalesModel";
import CreateSaleModal from "../../components/CreateSaleModal/CreateSaleModal";
import styled from "styled-components";
import ProductModalForm from "../../components/ProductModalForm/ProductModalForm";
import {deleteProduct, getProducts} from "../../services/productService";
import {
    ecommerceNames,
    ECommerceTypes, getScheduleStatus, handleSchedulePromotion, handleScheduleWsPromotion,
    promoteProduct, PublicationTypes,
} from "../../services/promotions";
import {IProduct} from "../../components/Product/Product";
import {toast} from "react-toastify";
import {useHistory} from "react-router";
import ClientModalForm from "../../components/ClientModalForm/ClientModalForm";
import {ecommerceMessages, errorMessages} from "../../models/messages";
import {
    CONNECTED_EVENT, DEV_SOCKET_URL,
    onSocketOnce,
    PROD_SOCKET_URL,
} from "../../utils/socket.io";
import * as io from "socket.io-client";
import {EcommerceEvents, ScheduleEvents} from "../../models/socket-events";
import {CompanyTypes, ECommerceResponse} from "../../models/common";
import {ScheduleResponse} from "../../models/schedule";
import {
    WhatsappProductPromotionTypes,
    whatsappSessionNames,
    wsPromotionTypeList
} from "../../models/interfaces/WhatsappModels";
import BetuelTravelDashboard from "../BetuelTravelDashboard/BetuelTravelDashboard";
import useWhatsapp from "../../components/hooks/UseWhatsapp";
import {getCompanies} from "../../services/companies";
import {CompanyModel} from "../../models/companyModel";
import {ILaborDay, ILaborDayData, LaborDayTypes} from "../../models/interfaces/LaborDayModel";
import {getLaborDays, updateLaborDays} from "../../services/laborDaysService";
import {Schedule} from "../../components/Schedule/Schedule";
import {Navigation} from "../../components/Navigation/Navigation";
import InputMask from "react-input-mask";
import _ from "lodash"
// export const accountLogos: { [N in ]} ;

export const CreateNewFloatButton = styled.button`
  //position: fixed;
  //bottom: 30px;
  //right: 30px;

`;
export const FloatButton = styled.button`
  border-radius: 50%;
  height: 70px;
  width: 70px;
  background-color: #fff;
  padding: 0;

  i {
    font-size: 30px;
  }
`;

export const PromotionOption: any = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;

  .loading-spinner {
    display: ${(props: any) => (props.loading ? "block" : "none")};
    position: absolute;
    height: 30px;
    width: 30px;
  }
`;

const AccountsWrapper = styled.div`
  position: absolute;
  max-width: 5rem;
  z-index: 999;
  top: 100%;

  img {
    margin-bottom: 1.25rem;
    cursor: pointer;
    border-radius: 50px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.7);
  }
`;
export type ITotals = {
    [N in Exclude<keyof ISale, "productName">]: number;
};

export type IProductFilters = "MostProfit" | "MostSales";
const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
];

const companyLogos: { [N in CompanyTypes | string]: any } = {
    betueldance: BetuelDanceLogo,
    betueltech: BetuelTechLogo,
    betueltravel: BetuelTravelLogo,
    dixybaby: DixyBabyLogo,
};

const companyStorageKey = "betuelGroup:company";

export interface IDashboardComponent {
    portfolioMode?: boolean;
    company?: CompanyTypes;
}

const Dashboard: React.FunctionComponent<IDashboardComponent> = ({
                                                                     portfolioMode,
                                                                     company,
                                                                 }) => {
    const [companies, setCompanies] = useState<CompanyModel[]>([]);
    const [activeAddSaleModal, setActiveAddSaleModal] = React.useState(false);
    const [selectedCompanyId, setSelectedCompanyId] = React.useState<string>(
        (localStorage.getItem(company || companyStorageKey) as CompanyTypes) ||
        "betueltech"
    );
    const [selectedCompany, setSelectedCompany] = React.useState<CompanyModel>({} as CompanyModel);
    const [showAccounts, setShowAccounts] = React.useState(false);
    const [activeConfirmationModal, setActiveConfirmationModal] =
        React.useState(false);
    const [loadingApp, setLoadingApp] = React.useState(false);
    const [clientModalIsOpen, setClientModalIsOpen] = React.useState(false);
    const [productFormIsOpen, setProductFormIsOpen] = React.useState(false);
    const [whatsappPromotionIsRunning, setWhatsappPromotionIsRunning] = React.useState(false);
    const [productViewControlsVisibility, setProductViewControlsVisibility] = React.useState(true);
    const [promotionLoading, setPromotionLoading] = React.useState<{
        [N in ECommerceTypes | string]?: boolean;
    }>({});
    const [promotionDisabled, setPromotionDisabled] = React.useState<{
        [N in ECommerceTypes]?: boolean;
    }>({});
    const [enableSelection, setEnableSelection] = React.useState(false);
    const [editSale, setEditSale] = React.useState<ISale>({} as any);
    const [salesData, setSalesData] = React.useState<ISale[]>([]);
    const [salesTotals, setSalesTotals] = React.useState<ITotals>({} as any);
    const [tithe, setTithe] = React.useState(0);
    const [promotion, setPromotion] = React.useState(0);
    const [registeredDates, setRegisteredDates] = React.useState<string[]>([]);
    const [products, setProducts] = React.useState<IProductData[]>([]);
    const [filteredProducts, setFilteredProducts] = React.useState<IProductData[]>([]);
    const [selections, setSelections] = React.useState<IProductData[]>([]);
    const [filter, setFilter] = React.useState<IProductFilters>("MostProfit");
    const [editProduct, setEditProduct] = React.useState<Partial<IProductData>>(
        null as any
    );
    const [selectedECommerce, setSelectedECommerce] = React.useState<ECommerceTypes | "">();
    const [publicationType, setPublicationType] = React.useState<'story' | 'photo'>();
    const [recordedDate, setRecordedDate] = React.useState<string>(
        `${months[new Date().getMonth()]}-${new Date().getFullYear()}`
    );
    const [logo, setLogo] = React.useState(
        companyLogos[localStorage.getItem(companyStorageKey) as CompanyTypes] ||
        BetuelTechLogo
    );
    const tithePercent = 0.1;
    const promotionPercent = 0.3;
    const history = useHistory();
    const [socket, setSocket] = React.useState<io.Socket>();
    const {
        login,
    } = useWhatsapp('betuelgroup');

    const [scheduleIsOpen, setScheduleIsOpen] = React.useState(false);


    React.useEffect(() => {
        if (companies && companies.length > 0) {
            const company = companies.find((company) => company.companyId === selectedCompanyId);
            if (company) {
                setSelectedCompany(company);
                handleScheduledPromotionStatus(company);
            }
        }

    }, [companies]);

    // initializing socket
    React.useEffect(() => {
        setSocket(io.connect(PROD_SOCKET_URL));
    }, []);
    const toggleProductForm = () => {
        setEditProduct(null as any);
        setProductFormIsOpen(!productFormIsOpen);
    };

    const changeEditProduct = (direction: 'left' | 'right') => () => {
        if (!editProduct) return;
        const index = products.findIndex((product) => product._id === editProduct._id);
        if (direction === 'left') {
            if (index === 0) {
                setEditProduct(products[products.length - 1]);
            } else {
                setEditProduct(products[index - 1]);
            }
        } else {
            if (index === products.length - 1) {
                setEditProduct(products[0]);
            } else {
                setEditProduct(products[index + 1]);
            }
        }
    }

    const loadProductDetails = (product: Partial<IProductData>) => {
        setEditProduct(product);
        setProductFormIsOpen(true);
    };
    const onSelectProduct = (product: IProductData) => {
        if (enableSelection) {
            if (selections.find((prod) => prod._id === product._id)) {
                setSelections(selections.filter((prod) => prod._id !== product._id));
            } else {
                if (selections.length < 30) {
                    setSelections([...selections, product]);
                } else {
                    toast("¡Hey! Solo puedes seleccionar 30 articulos", {type: "info"});
                }
            }
            return;
        }
    };
    const selectProduct = (product: IProductData) => {
        const profit = product.price - product.cost;
        const sale: Partial<ISale> = {
            profit,
            product: product,
            unitPrice: product.price,
            shipping: 0,
            commission: product.commission,
            date: recordedDate,
            params: (product.productParams || []).map((item: IProductParam) => ({
                ...item,
                _id: undefined,
                productParam: item._id,
                quantity: 0,
                relatedParams: (item.relatedParams || []).map((related: IProductParam) => ({
                    ...related,
                    _id: undefined,
                    productParam: related._id,
                    quantity: 0,
                })),
            })),
        };

        setEditSale(sale as any);
        setActiveAddSaleModal(true);
    };

    const getSalesData = async (date?: string) => {
        setLoadingApp(true);
        const salesData = await getSales(selectedCompanyId, date || recordedDate);
        setSalesData(salesData);
        setLoadingApp(false);
    };

    const getAllProducts = async () => {
        setLoadingApp(true);
        const products = await getProducts(company || selectedCompanyId);
        setProducts(products);
        setFilteredProducts(products);
        setLoadingApp(false);
    };

    React.useEffect(() => {
        getSalesData();
        getAllRecordsDates();
    }, []);

    React.useEffect(() => {
        getAllProducts();
        // !!company && setSelectedCompany(company);
    }, [company]);

    const getAllRecordsDates = async () => {
        const dates: string[] = await getRecordedDates();
        const existActualDate = (dates as any).find(
            (item: string) => item === recordedDate
        );
        if (!existActualDate) {
            dates.push(recordedDate);
        }

        setRegisteredDates(dates as any);
    };

    const setAllDashboardTotals = () => {
        const newTotals: ITotals = {} as any;
        (
            Object.keys({
                shipping: 0,
                commission: 0,
                amount: 0,
                profit: 0,
                quantity: 0,
            } as ITotals) as any
        ).forEach((key: keyof ITotals) => {
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
        salesData
            .map((item: ISale) => (!_.get(item, key) ? null : (_.get(item, key) as any)))
            .filter((item) => !!item)
            .reduce((a: number, b: number) => a + b, 0);

    const getProductSales = (productId: string) => {
        return !salesData
            ? 0
            : salesData.filter((sale) => (sale.product?._id || sale.productId) === productId).length;
    }

    const getProductMoney = (productId: string) => {
        if (!salesData) return 0;
        const totalSold = salesData
            .filter((sale) => (sale.product?._id || sale.productId) === productId)
            .map((item) => item.profit)
            .reduce((a, b) => a + b, 0);

        return totalSold;
    };

    const toggleAddSale = () => {
        setActiveAddSaleModal(!activeAddSaleModal);
        if (!activeAddSaleModal) {
            setEditSale({} as any)
        }
    };

    const toggleConfirmation = () =>
        setActiveConfirmationModal(!activeConfirmationModal);

    const mostProfitProducts = (sales: ISale[]): IProductData[] => {
        return products.sort((a: IProductData, b: IProductData) => {
            const aProfit = sales
                .map((sale) => ((sale.product?._id || sale.productId) === a._id ? sale.profit : undefined))
                .filter((item) => !!item)
                .reduce((a, b) => Number(a) + Number(b), 0);

            const bProfit = sales
                .map((sale) => ((sale.product?._id || sale.productId) === b._id ? sale.profit : undefined))
                .filter((item) => !!item)
                .reduce((a, b) => Number(a) + Number(b), 0);
            return Number(bProfit) - Number(aProfit);
        });
    };

    const mostSalesProducts = (sales: ISale[]): IProductData[] => {
        return products.sort((a: IProductData, b: IProductData) => {
            const aSales = sales.filter((sale) => (sale.product?._id || sale.productId) === a._id).length;
            const bSales = sales.filter((sale) => (sale.product?._id || sale.productId) === b._id).length;

            return Number(bSales) - Number(aSales);
        });
    };

    const filterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {checked} = e.target;
        const filter: IProductFilters = checked ? "MostSales" : "MostProfit";
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

    const onChangeDateRegistered = async (
        ev: React.ChangeEvent<HTMLInputElement>
    ) => {
        const {value} = ev.target;
        setRecordedDate(value);
        getSalesData(value);
    };

    const destroyUnusedSocket = () => {
        const isPromotionRunning = Object.keys(promotionLoading)
            .map((key: any) => !!(promotionLoading as any)[key as any])
            .reduce((a, b) => a && b, true);

        if (!isPromotionRunning) {
            socket?.removeAllListeners();
            socket?.disconnect();
            socket?.close();
        }
    };

    React.useEffect(() => {

        if (socket && !!selectedECommerce) {
            if (socket.connected) {
                if (selectedECommerce === "facebook") {
                    setPromotionDisabled({
                        ...promotionDisabled,
                        corotos: true,
                        flea: true,
                        whatsapp: true,
                        instagram: true,
                    });
                } else {
                    setPromotionDisabled({
                        ...promotionDisabled,
                        facebook: true,
                        flea: false,
                        whatsapp: false,
                        corotos: false,
                        instagram: false,
                    });
                }

                promoteSelectedProduct(
                    selectedECommerce as ECommerceTypes as ECommerceTypes,
                    selections
                );
                setSelectedECommerce("");
            } else {
                socket.on(CONNECTED_EVENT, async () => {


                    promoteSelectedProduct(
                        selectedECommerce as ECommerceTypes,
                        selections
                    );
                    setSelectedECommerce("");
                });
            }
        }
    }, [socket, selectedECommerce]);

    const promoteSelectedProduct = async (
        ecommerceType: ECommerceTypes,
        data: Partial<IProductData>[] = selections
    ) => {
        // do nothing while loading or selection mode isn't active
        if (
            (data.length > 1 && !enableSelection)
        ) {
            return;
        }
        try {
            if (data.length <= 0) {
                toast(errorMessages.SELECT_AT_LEAST_ONE_PRODUCT, {type: "error"});
                return;
            }

            await promoteProduct(data as IProduct[], ecommerceType, selectedCompanyId, publicationType);
        } catch (err) {
            console.error("promotion error: ", err);
            setPromotionLoading((data) => ({
                ...data,
                [ecommerceType]: false,
            }));
        }
    };
    const handlePromoteProduct =
        (
            ecommerceType: ECommerceTypes,
            type?: PublicationTypes
        ) =>
            async () => {
                setSelectedECommerce(ecommerceType);
                setPublicationType(type)
            };


    const toggleClientFormModal = () => setClientModalIsOpen(!clientModalIsOpen);

    const handleWhatsappPromotion = () => {
        toggleClientFormModal();
    };
    const toggleCompanies = () => setShowAccounts(!showAccounts);

    React.useEffect(() => {
        const getProds = async () => {
            await getAllProducts();
        };
        getProds();
        const getSales = async () => {
            await getSalesData();
        };
        getSales();
    }, [selectedCompanyId]);

    const selectCompany = (companyId: string) => async () => {
        const company = companies.find((company) => company.companyId === companyId);
        setSelectedCompanyId(companyId);
        setSelectedCompany(company || {} as CompanyModel);
        handleScheduledPromotionStatus(company)
        localStorage.setItem(companyStorageKey, companyId);
        toggleCompanies();
        setSelections([]);
        setLogo(company?.logo || '');
    };


    const handleGetCompanies = async () => {
        setCompanies(await getCompanies());
    }

    const handleScheduledPromotionStatus = async (company: CompanyModel = selectedCompany) => {
        const response = await getScheduleStatus(selectedCompanyId);
        const status: 'running' | 'npm' | 'error' = response.status;
        const wsPromotionStatus = response.wsPromotionStatus
        setWhatsappPromotionIsRunning(wsPromotionStatus === 'running')
        // toast(`${company.name} Automation is ${status}`);
        setPromotionLoading((data) => ({
            ...promotionLoading,
            ...data,
            [selectedCompanyId]: status === "running"
        }));
    }

    useEffect(() => {
        handleGetCompanies();
    }, []);


    const runPromotion = (sessionId: string) => async () => {
        const action = promotionLoading[sessionId] ? "stop" : "run";

        const response: any = await (
            await handleSchedulePromotion(sessionId, action)
        ).json();

        const status: 'running' | 'stopped' | 'error' = response.status;
        toast(`${ecommerceNames[sessionId]} is ${status}`);

        setPromotionLoading((data) => ({
            ...promotionLoading,
            ...data,
            [sessionId]: status === "running"
        }));
    };

    const runWhatsappPromotion = (type?: WhatsappProductPromotionTypes) => async () => {
        const action = whatsappPromotionIsRunning ? "stop" : "run";

        const response: any = await (
            await handleScheduleWsPromotion(!!type ? 'run' :action, type)
        ).json();

        const status: 'running' | 'stopped' | 'error' = response.status;
        toast(`Whatsapp Promotion is ${status}`);
        setWhatsappPromotionIsRunning(action === 'run');
    };

    const runPromotionEvents = () => {

        onSocketOnce(
            socket as io.Socket,
            EcommerceEvents.ON_PUBLISHING,
            (response: ECommerceResponse) => {
                setPromotionLoading((data) => ({
                    ...data,
                    [response.ecommerce]: true,
                }));
                toast(ecommerceMessages.START_PUBLISHING(response.ecommerce), {
                    type: "default",
                });
            }
        );

        onSocketOnce(
            socket as io.Socket,
            EcommerceEvents.ON_PUBLISHED,
            (response: ECommerceResponse) => {
                toast(
                    ecommerceMessages.PUBLISHED_ITEM(
                        response.ecommerce,
                        response.publication || ({} as IProductData)
                    ),
                    {
                        type: "success",
                        autoClose: false,
                    }
                );
            }
        );

        onSocketOnce(
            socket as io.Socket,
            EcommerceEvents.ON_COMPLETED,
            (response: ECommerceResponse) => {
                setPromotionLoading((data) => ({
                    ...data,
                    [response.ecommerce]: false,
                }));
                setPromotionDisabled((data) => ({
                    ...data,
                    facebook: false,
                    flea: false,
                    corotos: false,
                }));

                toast(
                    ecommerceMessages.COMPLETED_PUBLISHING(response.ecommerce),
                    {
                        type: "success",
                        autoClose: false,
                    }
                );
                // destroyUnusedSocket();
            }
        );

        onSocketOnce(
            socket as io.Socket,
            EcommerceEvents.ON_FAILED,
            (response: ECommerceResponse) => {
                setPromotionLoading((data) => ({
                    ...data,
                    [response.ecommerce]: false,
                    autoClose: false,
                }));
                toast(
                    errorMessages.ECOMMERCE_ERROR(
                        response.ecommerce,
                        response.error || "indefinido"
                    ),
                    {type: "error"}
                );
            }
        );
    }
    const runScheduleEvents = () => {
        onSocketOnce(
            socket as io.Socket,
            ScheduleEvents.EMIT_RUNNING,
            ({sessionId}: ScheduleResponse) => {
                setPromotionLoading((data) => ({
                    ...promotionLoading,
                    ...data,
                    [sessionId]: true
                }));
                toast(`${whatsappSessionNames[sessionId]} promotion is running`);
            }
        );

        onSocketOnce(
            socket as io.Socket,
            ScheduleEvents.EMIT_STOPPED,
            ({sessionId}: ScheduleResponse) => {
                setPromotionLoading((data) => ({
                    ...promotionLoading,
                    ...data,
                    [sessionId]: false
                }));
                toast(`${whatsappSessionNames[sessionId]} promotion is stopped`);
            }
        );

        onSocketOnce(
            socket as io.Socket,
            ScheduleEvents.EMIT_FAILED,
            ({sessionId, error}: ScheduleResponse) => {
                console.error(error);
                setPromotionLoading((data) => ({
                    ...promotionLoading,
                    ...data,
                    [sessionId]: false
                }));
                toast(`${whatsappSessionNames[sessionId]} occurred an error`);

            }
        );
    }

    const onDeleteProduct = async () => {
        setLoadingApp(true);
        const res = await deleteProduct(deleteProductId);
        setLoadingApp(false);
        getAllProducts();
        setDeleteConfirmationModal(false)
    };

    useEffect(() => {
        if (socket) {
            socket.on(CONNECTED_EVENT, () => {
                runScheduleEvents();
                runPromotionEvents();
            });
        }
    }, [socket]);

    const [deleteConfirmationModal, setDeleteConfirmationModal] = React.useState(false);
    const [deleteProductId, setDeleteProductId] = React.useState('');

    const toggleDeleteConfirmationModal = () => setDeleteConfirmationModal(!deleteConfirmationModal);

    const handleDeleteProduct = ({_id}: IProductData) => {
        setDeleteProductId(_id);
        setDeleteConfirmationModal(true);
    }

    const [igDropdown, setIgDropdown] = React.useState(false);
    const [wsPromoDropdown, setWsPromoDropdown] = React.useState(false);

    const toggleIgDropdown = () => setIgDropdown((prevState) => !prevState);
    const toggleWsPromoDropdown = () => setWsPromoDropdown((prevState) => !prevState);

    const onFilterProducts = (e: React.ChangeEvent<any>) => {
        const value = e.target.value;
        const text = (value || '').toLowerCase().replace(/[ ]/gi, '');
        const filteredProducts = products.filter((product: IProductData) => {
            const {name, description} = product;
            const productText = `${name} ${description}`.toLowerCase().replace(/[ ]/gi, '');
            return productText.includes(text);
        });
        setFilteredProducts(filteredProducts);
    }

    const goToOrders = () => {
        history.push('/orders');
    }

    const toggleSchedule = () => setScheduleIsOpen(!scheduleIsOpen);


    const [isFocused, setIsFocused] = useState(false);


    return (
        <>
            {!loadingApp ? null : (
                <>
                    <div className="loading-sale-container">
                        <Spinner animation="grow" variant="secondary"/>
                    </div>
                </>
            )}
            <Modal isOpen={deleteConfirmationModal} toggle={toggleDeleteConfirmationModal}>
                <ModalHeader toggle={toggleConfirmation}>Confirmación</ModalHeader>
                <ModalBody>
                    ¿Estas Seguro que deseas eliminar este producto?
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={onDeleteProduct}>Confirmar</Button>{' '}
                    <Button color="secondary" onClick={toggleDeleteConfirmationModal}>Cancel</Button>
                </ModalFooter>
            </Modal>
            <CreateSaleModal
                activeAddSaleModal={activeAddSaleModal}
                toggleAddSale={toggleAddSale}
                selectedSale={editSale}
                salesData={salesData}
                getSalesData={getSalesData}
                company={selectedCompanyId}
                loadProducts={getAllProducts}
            />
            {<div className="d-flex align-items-center flex-column">
                <Col lg={2} md={4} sm={4} className="p-4  logo-container">
                    <img
                        src={logo}
                        alt="Logo AudSongs"
                        className="w-100 logo"
                        onClick={toggleCompanies}
                    />
                    {showAccounts && (
                        <AccountsWrapper>
                            {companies.map((company: CompanyModel) => (
                                company.companyId !== selectedCompanyId && <img
                                    src={company.logo}
                                    onClick={selectCompany(company.companyId)}
                                    className="w-100"
                                />
                            ) as any)}
                        </AccountsWrapper>
                    )}
                </Col>
                {!portfolioMode && (
                    <>
                        <Col sm={12} className="d-flex justify-content-center mb-2">
                            <FormGroup>
                                <Input
                                    type="select"
                                    name="select"
                                    className="select-date"
                                    defaultValue={recordedDate}
                                    onChange={onChangeDateRegistered}
                                >
                                    {registeredDates ? (
                                        registeredDates?.map((item, i) => {
                                            const split = item?.split("-");
                                            const selected = item === recordedDate;
                                            if (!split) return;
                                            return (
                                                <option selected={selected} key={i} value={item}>
                                                    {split[0]} {split[1]}
                                                </option>
                                            );
                                        })
                                    ) : (
                                        <option>
                                            {" "}
                                            {months[new Date().getMonth()]} {new Date().getFullYear()}
                                        </option>
                                    )}
                                </Input>
                            </FormGroup>
                        </Col>
                        <div
                            className="d-flex flex-wrap justify-content-center mb-4 align-items-center justify-content-around col-sm-12 col-md-10 col-lg-10">
                            <div>
                                <Label className="d-flex flex-column align-items-center cursor-pointer">
                                    <Input
                                        id="selection"
                                        type="switch"
                                        className="customize-switch enable-selection-switch d-block"
                                        onChange={toggleEnableSelection}
                                    />
                                    <span>Habilitar Selection</span>
                                </Label>

                            </div>

                            <div className="d-flex align-items-center">
                                <Button onClick={toggleSchedule} color="primary"
                                        className="d-flex align-items-center gap-2" outline>
                                    <span>Horario</span>
                                    <i className="bi bi-calendar-week"/>
                                </Button>
                            </div>
                            <div
                                className={`d-flex align-items-center ${
                                    !enableSelection ? "disable-promotions" : ""
                                }`}
                            >
                                <PromotionOption
                                    loading={whatsappPromotionIsRunning}
                                >
                                    <Spinner
                                        className="loading-spinner"
                                        animation="grow"
                                        variant="secondary"
                                        size="sm"
                                    />
                                    <Dropdown isOpen={wsPromoDropdown} toggle={toggleWsPromoDropdown}>
                                        <DropdownToggle
                                            tag="span"
                                        >
                                            <i className="bi bi-whatsapp cursor-pointer promotion-icon text-primary"
                                            />
                                        </DropdownToggle>
                                        <DropdownMenu>
                                            <DropdownItem
                                                onClick={runWhatsappPromotion()}>
                                                {whatsappPromotionIsRunning ? 'Detener' : 'Iniciar'}
                                            </DropdownItem>

                                            {wsPromotionTypeList.map(({type, label}) =>
                                                <DropdownItem
                                                    onClick={runWhatsappPromotion(type)}>
                                                    {label}
                                                </DropdownItem>)
                                            }
                                        </DropdownMenu>
                                    </Dropdown>

                                </PromotionOption>
                                <PromotionOption
                                    loading={promotionLoading[selectedCompanyId]}
                                >
                                    <Spinner
                                        className="loading-spinner"
                                        animation="grow"
                                        variant="secondary"
                                        size="sm"
                                    />
                                    <i className="bi bi-activity cursor-pointer promotion-icon text-primary"
                                       onClick={runPromotion(selectedCompanyId)}/>
                                </PromotionOption>
                                <PromotionOption loading={false}>
                                    <Spinner
                                        className="loading-spinner"
                                        animation="grow"
                                        variant="secondary"
                                        size="sm"
                                    />
                                    <i
                                        data-toggle="tooltip"
                                        title="Abrir Whatsapp"
                                        className="bi bi-whatsapp text-success cursor-pointer promotion-icon"
                                        onClick={handleWhatsappPromotion}
                                    />
                                </PromotionOption>
                                <PromotionOption loading={promotionLoading.facebook}>
                                    <Spinner
                                        className="loading-spinner"
                                        animation="grow"
                                        variant="secondary"
                                        size="sm"
                                    />
                                    <i
                                        data-toggle="tooltip"
                                        title="Publicar Seleccionados en Facebook Marketplace"
                                        className="bi bi-facebook text-info cursor-pointer promotion-icon facebook-icon"
                                        onClick={handlePromoteProduct("facebook")}
                                    />
                                </PromotionOption>
                                <PromotionOption loading={promotionLoading.instagram}>
                                    <Spinner
                                        className="loading-spinner"
                                        animation="grow"
                                        variant="secondary"
                                        size="sm"
                                    />
                                    <Dropdown isOpen={igDropdown} toggle={toggleIgDropdown}>
                                        <DropdownToggle
                                            tag="span"
                                        >
                                            <i
                                                data-toggle="tooltip"
                                                title="Publicar Seleccionados en Instagram"
                                                className="bi bi-instagram  cursor-pointer promotion-icon instagram-icon"
                                            />
                                        </DropdownToggle>
                                        <DropdownMenu>
                                            <DropdownItem
                                                onClick={handlePromoteProduct("instagram", 'photo')}>
                                                Publicacion
                                            </DropdownItem>
                                            <DropdownItem
                                                onClick={handlePromoteProduct("instagram", 'story')}>
                                                Story
                                            </DropdownItem>
                                        </DropdownMenu>
                                    </Dropdown>
                                </PromotionOption>
                                <PromotionOption loading={promotionLoading.flea}>
                                    <Spinner
                                        className="loading-spinner"
                                        animation="grow"
                                        variant="secondary"
                                        size="sm"
                                    />
                                    <img
                                        src={FleaFavicon}
                                        data-toggle="tooltip"
                                        title="Publicar Seleccionados en La Pulga"
                                        className="text-info cursor-pointer promotion-icon img-promotion-icon"
                                        onClick={handlePromoteProduct("flea")}
                                    />
                                </PromotionOption>
                                <PromotionOption loading={promotionLoading.corotos}>
                                    <Spinner
                                        className="loading-spinner"
                                        animation="grow"
                                        variant="secondary"
                                        size="sm"
                                    />
                                    <img
                                        src={CorotosFavicon}
                                        data-toggle="tooltip"
                                        title="Publicar Seleccionados en Corotos"
                                        className="text-info cursor-pointer promotion-icon img-promotion-icon"
                                        onClick={handlePromoteProduct("corotos")}
                                    />
                                </PromotionOption>
                            </div>
                        </div>

                        <Col
                            lg={10}
                            md={10}
                            sm={12}
                            className="d-flex justify-content-center"
                        >
                            <Row className="justify-content-center label-grid col-lg-10">
                                <StatisticLabel
                                    label="Ordenes"
                                    text={salesData?.length?.toString()}
                                    className="total-label"
                                />
                                <StatisticLabel
                                    label="Ventas"
                                    text={salesTotals.quantity}
                                    className="total-label"
                                />
                                <StatisticLabel
                                    label="Vendido"
                                    amount={salesTotals.amount}
                                    className="total-label"
                                />
                                <StatisticLabel
                                    label="Beneficio"
                                    amount={salesTotals.profit}
                                    className="total-label"
                                />
                                <StatisticLabel
                                    label="Promoción"
                                    amount={promotion}
                                    className="total-label"
                                />
                                <StatisticLabel
                                    label="Diezmo"
                                    amount={tithe}
                                    className="total-label"
                                />
                            </Row>
                        </Col>
                    </>
                )}
                {selectedCompanyId === 'betueltravel' ?
                    <BetuelTravelDashboard/> : <>
                        <Col
                            lg={8}
                            md={10}
                            sm={12}
                        >
                            <Input onChange={onFilterProducts} placeholder="Buscar por nombre o descripcion"></Input>
                        </Col>
                        <Col
                            lg={8}
                            md={10}
                            sm={12}
                            className={`cards mt-3 ${enableSelection ? "cards-shrink" : ""}`}
                        >
                            {filteredProducts.map((item, i) => (
                                <Product
                                    {...item}
                                    portfolioMode={portfolioMode}
                                    selected={!!selections.find((prod) => prod._id === item._id)}
                                    onSelect={onSelectProduct}
                                    enableSelection={enableSelection}
                                    loadSale={selectProduct}
                                    loadProductDetails={loadProductDetails}
                                    salesQuantity={getProductSales(item._id)}
                                    moneyGenerated={getProductMoney(item._id) as number}
                                    onRemoveProduct={handleDeleteProduct}
                                    key={i}
                                />
                            ))}
                        </Col>
                    </>}
            </div>}

            {!portfolioMode && (
                <FloatButton
                    className="btn btn-outline-danger create-product-button"
                    onClick={toggleProductForm}
                >
                    <i className="bi-plus"/>
                </FloatButton>
            )}


            {productFormIsOpen &&
                <div className="view-product-wrapper" id="product-view-wrapper">
                    {productViewControlsVisibility && editProduct && <>
                        <FloatButton onClick={changeEditProduct('left')}
                                     className="left btn btn-outline-danger change-product-button">
                            <i className="bi bi-chevron-left"/>
                        </FloatButton>
                        <FloatButton onClick={changeEditProduct('right')}
                                     className="right btn btn-outline-danger change-product-button">
                            <i className="bi bi-chevron-right"/>
                        </FloatButton>
                    </>}
                    <ProductModalForm
                        portfolioMode={portfolioMode}
                        handlePromoteProduct={handlePromoteProduct}
                        promotionLoading={promotionLoading}
                        loadProducts={getAllProducts}
                        isOpen={productFormIsOpen}
                        toggle={toggleProductForm}
                        company={selectedCompanyId}
                        editProduct={editProduct}
                        setProductViewControlsVisibility={setProductViewControlsVisibility}
                    />

                </div>

            }

            <ClientModalForm
                promotionLoading={promotionLoading}
                selectedProducts={selections}
                setSelectedProducts={setSelections}
                isOpen={clientModalIsOpen}
                toggle={toggleClientFormModal}
            />
            <Modal isOpen={scheduleIsOpen}
                   backdrop="static"
                   toggle={toggleSchedule}
                   className="client-form-container"
                   contentClassName="schedule-content"
            >
                <ModalHeader
                    toggle={toggleSchedule}
                >
                    Horario Laboral
                </ModalHeader>
                <ModalBody className="schedule-grid">
                    <Schedule/>
                </ModalBody>
            </Modal>
        </>
    );
};

export default Dashboard;
