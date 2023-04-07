import React, { useEffect } from "react";
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
  Button
} from "reactstrap";
import { MoneyStatisticLabel, Product } from "../../components";
import BetuelTechLogo from "../../assets/images/betueltech.png";
import Cat from "../../assets/images/cat.jpeg";
import BetuelDanceLogo from "../../assets/images/betueldance/logo.png";
import BetuelTravelLogo from "../../assets/images/betueltravel.png";
import CorotosFavicon from "../../assets/images/corotos-favicon.png";
import FleaFavicon from "../../assets/images/flea-favicon.png";
import "./Dashboard.scss";
import { IProductData } from "../../model/products";
import { getRecordedDates, getSales } from "../../services/sales";
import { ISale } from "../../model/interfaces/SalesModel";
import CreateSaleModal from "../../components/CreateSaleModal/CreateSaleModal";
import styled from "styled-components";
import ProductModalForm from "../../components/ProductModalForm/ProductModalForm";
import {deleteProduct, getProducts} from "../../services/products";
import {
  ecommerceNames,
  ECommerceTypes, handleSchedulePromotion,
  promoteProduct,
  startWhatsappServices,
} from "../../services/promotions";
import { IProduct } from "../../components/Product/Product";
import { toast } from "react-toastify";
import { useHistory } from "react-router";
import ClientModalForm from "../../components/ClientModalForm/ClientModalForm";
import { ecommerceMessages, errorMessages } from "../../model/messages";
import {
  CONNECTED_EVENT,
  DEV_SOCKET_URL,
  onSocketOnce,
  PROD_SOCKET_URL,
} from "../../utils/socket.io";
import * as io from "socket.io-client";
import {EcommerceEvents, ScheduleEvents, WhatsappEvents} from "../../model/socket-events";
import { CompanyTypes, ECommerceResponse } from "../../model/common";
import { Socket } from "socket.io-client";
import {ScheduleResponse} from "../../model/schedule";
import {whatsappSessionNames, WhatsappSessionTypes} from "../../model/interfaces/WhatsappModels";
const Marvin = require("marvinj");
// export const accountLogos: { [N in ]} ;

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
`;
export const LogOutButton = styled(CreateNewProductButton)`
  position: absolute;
  top: 15px;
  bottom: unset;
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

const companyLogos: { [N in CompanyTypes]: any } = {
  betueldance: BetuelDanceLogo,
  betueltech: BetuelTechLogo,
};

const companyStorageKey = "betuelGroup:company";

export interface IDashboardComponent {
  setToken?: any;
  portfolioMode?: boolean;
  company?: CompanyTypes;
}

const Dashboard: React.FunctionComponent<IDashboardComponent> = ({
  setToken,
  portfolioMode,
  company,
}) => {
  const [activeAddSaleModal, setActiveAddSaleModal] = React.useState(false);
  const [selectedCompany, setSelectedCompany] = React.useState<CompanyTypes>(
    (localStorage.getItem(company || companyStorageKey) as CompanyTypes) ||
      "betueltech"
  );
  const [showAccounts, setShowAccounts] = React.useState(false);
  const [activeConfirmationModal, setActiveConfirmationModal] =
    React.useState(false);
  const [loadingApp, setLoadingApp] = React.useState(false);
  const [clientModalIsOpen, setClientModalIsOpen] = React.useState(false);
  const [productFormIsOpen, setProductFormIsOpen] = React.useState(false);
  const [promotionLoading, setPromotionLoading] = React.useState<{
    [N in ECommerceTypes]?: boolean;
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
  const [selections, setSelections] = React.useState<IProductData[]>([]);
  const [filter, setFilter] = React.useState<IProductFilters>("MostProfit");
  const [editProduct, setEditProduct] = React.useState<Partial<IProductData>>(
    null as any
  );
  const [selectedECommerce, setSelectedECommerce] = React.useState<
    ECommerceTypes | ""
  >();
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

  // initializing socket
  React.useEffect(() => {
    setSocket(io.connect(PROD_SOCKET_URL));
  }, []);
  const toggleProductForm = () => {
    setEditProduct(null as any);
    setProductFormIsOpen(!productFormIsOpen);
  };

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
          toast("¡Hey! Solo puedes seleccionar 30 articulos", { type: "info" });
        }
      }
      return;
    }
  };
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
    const salesData = await getSales(selectedCompany, date || recordedDate);
    setSalesData(salesData);
    setLoadingApp(false);
  };

  const getAllProducts = async () => {
    setLoadingApp(true);
    const products = await getProducts(company || selectedCompany);
    setProducts(products);
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
        price: 0,
        profit: 0,
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
      .map((item: ISale) => (!item[key] ? null : (item[key] as any)))
      .filter((item) => !!item)
      .reduce((a: number, b: number) => a + b, 0);

  const getProductSales = (productId: string) =>
    !salesData
      ? 0
      : salesData.filter((sale) => sale.productId === productId).length;

  const getProductMoney = (productId: string) => {
    if (!salesData) return 0;
    const totalSold = salesData
      .filter((sale) => sale.productId === productId)
      .map((item) => item.profit)
      .reduce((a, b) => a + b, 0);

    return totalSold;
  };

  const toggleAddSale = () => {
    setActiveAddSaleModal(!activeAddSaleModal);
  };

  const toggleConfirmation = () =>
    setActiveConfirmationModal(!activeConfirmationModal);

  const mostProfitProducts = (sales: ISale[]): IProductData[] => {
    return products.sort((a: IProductData, b: IProductData) => {
      const aProfit = sales
        .map((sale) => (sale.productId === a._id ? sale.profit : undefined))
        .filter((item) => !!item)
        .reduce((a, b) => Number(a) + Number(b), 0);

      const bProfit = sales
        .map((sale) => (sale.productId === b._id ? sale.profit : undefined))
        .filter((item) => !!item)
        .reduce((a, b) => Number(a) + Number(b), 0);
      return Number(bProfit) - Number(aProfit);
    });
  };

  const mostSalesProducts = (sales: ISale[]): IProductData[] => {
    return products.sort((a: IProductData, b: IProductData) => {
      const aSales = sales.filter((sale) => sale.productId === a._id).length;
      const bSales = sales.filter((sale) => sale.productId === b._id).length;

      return Number(bSales) - Number(aSales);
    });
  };

  const filterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    const filter: IProductFilters = checked ? "MostSales" : "MostProfit";
    setFilter(filter);
  };

  const toggleEnableSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
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
    const { value } = ev.target;
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
    console.log("klk?", socket?.connected, selectedECommerce)

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
        console.log('connect');
        socket.on(CONNECTED_EVENT, async () => {
          console.log('goood!!')


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
        toast(errorMessages.SELECT_AT_LEAST_ONE_PRODUCT, { type: "error" });
        return;
      }

      await promoteProduct(data as IProduct[], ecommerceType, selectedCompany);
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
      data: Partial<IProductData>[] = selections
    ) =>
    async () => {
        setSelectedECommerce(ecommerceType);
    };

  const logOut = () => {
    localStorage.setItem("authToken", "");
    setToken("");
  };

  const togglePortfolioDashboard = () => {
    if (portfolioMode) {
      history.push("/dashboard");
    } else {
      history.push(`/portfolio/${selectedCompany}`);
    }
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
  }, [selectedCompany]);

  const selectCompany = (company: CompanyTypes) => async () => {
    setSelectedCompany(company);
    localStorage.setItem(companyStorageKey, company);
    toggleCompanies();
    setLogo(companyLogos[company]);
  };



  useEffect(() => {
    const callPromotion = async () => {
      await runPromotion('betueldance')();
      await runPromotion('betueltech')();
      // runPromotion('betueltravel')();
    }
    callPromotion();

  }, []);



  const runPromotion = (sessionId: ECommerceTypes) => async () => {
    const action = promotionLoading[sessionId] ? "stop" : "run";

    const response: any = await (
      await handleSchedulePromotion(sessionId, action)
    ).json();

    const status: 'running' | 'stopped' | 'error'  = response.status;
    toast(`${ecommerceNames[sessionId]} is ${status}`);

    setPromotionLoading((data) => ({
      ...promotionLoading,
      ...data,
      [sessionId]: status === "running"
    }));
  };

  const runPromotionEvents = () => {
    console.log('runPromotionEvents');

    (socket as io.Socket).on(
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
          console.log('published', response)
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

          console.log("completed", response)
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
              { type: "error" }
          );
        }
    );
  }
  const runScheduleEvents = () => {
    onSocketOnce(
        socket as io.Socket,
        ScheduleEvents.EMIT_RUNNING,
        ({ sessionId }: ScheduleResponse) => {
          console.log("sessionId", sessionId);
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
        ({ sessionId }: ScheduleResponse) => {
          console.log("sessionId", sessionId);
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
        ({ sessionId, error }: ScheduleResponse) => {
          console.log("sessionId", sessionId);
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
    console.log('deleted item', res);
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

  const handleDeleteProduct = ({ _id }: IProductData) => {
    setDeleteProductId(_id);
    setDeleteConfirmationModal(true);
  }

 return (
    <>
      {!loadingApp ? null : (
        <>
          <div className="loading-sale-container">
            <Spinner animation="grow" variant="secondary" />
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
        company={selectedCompany}
        loadProducts={getAllProducts}
      />
      <div className="d-flex align-items-center flex-column">
        {localStorage.getItem("authToken") && (
          <Col sm={8} className="position-relative">
            <LogOutButton
              className="btn btn-outline-danger"
              title="Salir"
              onClick={logOut}
            >
              <i className="bi bi-box-arrow-right" />
            </LogOutButton>
            <LogOutButton
              className="btn btn-outline-danger go-to-portfolio"
              title={`Ir al ${portfolioMode ? "Dashboard" : "al Portafolio"}`}
              onClick={togglePortfolioDashboard}
            >
              <i
                className={`bi ${
                  portfolioMode
                    ? "bi-skip-backward-fill"
                    : "bi-skip-forward-fill"
                } `}
              />
            </LogOutButton>
          </Col>
        )}
        <Col lg={2} md={4} sm={4} className="p-4  logo-container">
          <img
            src={logo}
            alt="Logo AudSongs"
            className="w-100 logo"
            onClick={toggleCompanies}
          />
          {showAccounts && (
            <AccountsWrapper>
              {selectedCompany === "betueldance" ? (
                <img
                  src={BetuelTechLogo}
                  onClick={selectCompany("betueltech")}
                  alt="Logo Betuel Dance"
                  className="w-100"
                />
              ) : (
                <img
                  src={BetuelDanceLogo}
                  onClick={selectCompany("betueldance")}
                  alt="Logo Betuel Dance"
                  className="w-100"
                />
              )}
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
                    registeredDates.map((item, i) => {
                      const split = item.split("-");
                      const selected = item === recordedDate;
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
            <div className="d-flex justify-content-center mb-4 align-items-center justify-content-around col-sm-12 col-md-10 col-lg-10">
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
                <label className="me-2 mb-0">Más Ingresos</label>
                <Input
                  id="sales"
                  type="switch"
                  label="Más Vendidos"
                  className="customize-switch"
                  onChange={filterChange}
                />
              </div>
              <div
                className={`d-flex align-items-center ${
                  !enableSelection ? "disable-promotions" : ""
                }`}
              >
                {/*<PromotionOption>*/}
                {/*  <Spinner className="loading-spinner" animation="grow" variant="secondary" size="sm"/>*/}
                {/*  <i data-toggle="tooltip"*/}
                {/*     title="Enviar Seleccionados por Whatsapp"*/}
                {/*     className="bi bi-instagram instagram-icon cursor-pointer promotion-icon"*/}
                {/*  />*/}
                {/*</PromotionOption>*/}
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
                <PromotionOption
                  loading={promotionLoading.betueltravel}
                >
                  <Spinner
                    className="loading-spinner"
                    animation="grow"
                    variant="secondary"
                    size="sm"
                  />
                  <img
                    src={BetuelTravelLogo}
                    data-toggle="tooltip"
                    className="bi-whatsapp cursor-pointer promotion-icon img-promotion-icon"
                    // onClick={runPromotion("betueltravel")}
                  />
                </PromotionOption>
                <PromotionOption
                    loading={promotionLoading.betueltech}
                >
                  <Spinner
                      className="loading-spinner"
                      animation="grow"
                      variant="secondary"
                      size="sm"
                  />
                  <img
                      src={BetuelTechLogo}
                      data-toggle="tooltip"
                      className="bi-whatsapp cursor-pointer promotion-icon img-promotion-icon"
                      onClick={runPromotion("betueltech")}
                  />
                </PromotionOption>
                <PromotionOption
                    loading={promotionLoading.betueldance}
                >
                  <Spinner
                      className="loading-spinner"
                      animation="grow"
                      variant="secondary"
                      size="sm"
                  />
                  <img
                      src={BetuelDanceLogo}
                      data-toggle="tooltip"
                      className="bi-whatsapp cursor-pointer promotion-icon img-promotion-icon"
                      onClick={runPromotion("betueldance")}
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
                  <i
                      data-toggle="tooltip"
                      title="Publicar Seleccionados en Instagram"
                      className="bi bi-instagram  cursor-pointer promotion-icon instagram-icon"
                      onClick={handlePromoteProduct("instagram")}
                  />
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
          </>
        )}
        <Col
          lg={8}
          md={10}
          sm={12}
          className={`cards mt-3 ${enableSelection ? "cards-shrink" : ""}`}
        >
          {products.map((item, i) => (
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
      </div>

      {!portfolioMode && (
        <CreateNewProductButton
          className="btn btn-outline-danger"
          onClick={toggleProductForm}
        >
          <i className="bi-plus" />
        </CreateNewProductButton>
      )}

      <ProductModalForm
        portfolioMode={portfolioMode}
        handlePromoteProduct={handlePromoteProduct}
        promotionLoading={promotionLoading}
        loadProducts={getAllProducts}
        isOpen={productFormIsOpen}
        toggle={toggleProductForm}
        company={selectedCompany}
        editProduct={editProduct}
      />

      <ClientModalForm
        promotionLoading={promotionLoading}
        selectedProducts={selections}
        setSelectedProducts={setSelections}
        isOpen={clientModalIsOpen}
        toggle={toggleClientFormModal}
      />
    </>
  );
};

export default Dashboard;
