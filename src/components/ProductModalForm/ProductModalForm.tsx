import {
    Button,
    Form,
    FormGroup,
    Input,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader, Spinner, Tooltip,
} from "reactstrap";
import React, {useCallback, useEffect, useRef} from "react";
import {IProductBackground, IProductData} from "../../model/products";
import {Rnd} from 'react-rnd';
import logo from "../../assets/images/betueltech.png";
import btBackground1 from "../../assets/images/product-background.png";
import bdBackground1 from "../../assets/images/betueldance/Fondo1.png";
import bdBackground2 from "../../assets/images/betueldance/Fondo2.png";
import bdBackground3 from "../../assets/images/betueldance/Fondo3.png";
import bdBackground4 from "../../assets/images/betueldance/Fondo4.png";

import styled from "styled-components";
import "./ProductModalForm.scss";
import {toPng} from 'html-to-image';
import {dataURItoBlob} from "../../utils/blob";
import {gcloudPublicURL, uploadGCloudImage} from "../../services/gcloud";
import {addProduct, updateProducts} from "../../services/products";
import {ECommerceTypes, getWhatsappMessageURL, PublicationTypes} from "../../services/promotions";
import CorotosFavicon from "../../assets/images/corotos-favicon.png";
import FleaFavicon from "../../assets/images/flea-favicon.png";
import {PromotionOption} from "../../screens/Dashboard/Dashboard";
import {CompanyTypes} from "../../model/common";
import FlyerDesigner from "../FlyerDesigner/FlyerDesigner";
import {IFlyer} from "../../model/interfaces/FlyerDesigner.interfaces";


const draggableWidth = 300;
const draggableHeight = 300;
const nameInitialFontSize: { [N in CompanyTypes]: number } = {
    betueldance: 80,
    betueltech: 30,
    betueltravel: 30,
};

export interface ICalculatedPrice {
    price: number;
    wholeSale: string;
}

export interface IProductFormProps {
    toggle: () => any;
    loadProducts: () => any;
    handlePromoteProduct: (ecommerceType: ECommerceTypes) => () => any;
    isOpen?: boolean;
    portfolioMode?: boolean;
    promotionLoading: { [N in ECommerceTypes]?: boolean };
    editProduct?: Partial<IProductData>;
    company: CompanyTypes;
}

export interface IProductImageProperties {
    width: number;
    height: number;
    x: number;
    y: number;
    fontSize?: number;
    enableShadow?: boolean;
    selectedBackground: number;
}

const ProductNameSpan: any = styled.span`
  position: absolute;
  bottom: 15px;
  font-size: ${(props: any) => props.fontSize}px;
  z-index: 999;
  transform: translate(15px, 0px);
  max-width: 206px;
  line-height: ${(props: any) => props.fontSize}px;

  &.betueldance {
    bottom: unset;
    top: 20px;
    width: 100%;
    text-align: center;
    max-width: unset;
    font-size: 'anisha';
    font-size: ${(props: any) => props.fontSize}px;
    font-family: betueldance-font;
  }
`;

const ChangePhotoLabel: any = styled.label`
  position: absolute;
  right: -35px;
  color: #ababab;
  cursor: pointer;
  font-size: 35px;

  &.betueldance {
    color: white;
  }
`;
const ProductPriceSpan = styled.span`
  position: absolute;
  bottom: 10px;
  font-size: ${(props: any) => props.fontSize || 85}px;
  line-height: ${(props: any) => props.fontSize || 85}px;
  z-index: 999;
  right: 15px;

  &.betueldance {
    right: unset;
    width: 100%;
    text-align: center;
    font-size: ${(props: any) => props.fontSize || 60}px;
  }
`;

const GodWordSpan = styled.span`
  position: absolute;
  bottom: 15px;
  right: 15px;
  font-size: ${(props: any) => props.fontSize || 25}px;
  z-index: 999;
  color: #c3c3c3;

  &.betueldance {
    background: white;
    padding: 0 10px;
    border-radius: 20px;
    color: rgba(0, 0, 0, .6);
    font-size: 14px;
  }

`;

const ProductImageContainer: any = styled.div`
  position: absolute;
  z-index: 999;
  width: 100%;
  height: 100%;

  .rnd-container {
    input[type="file"] {
      z-index: -1;
    }

    a:focus > img {
      border: ${(props: any) => props.portfolioMode ? 'unset' : '3px dashed #ababab'};
    }
  }

  .product-arrows {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px;

    .bi {
      cursor: pointer;
      font-size: 21px;
      border-radius: 21px;
      height: 40px;
      width: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all .3s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.5);
      }
    }
  }

`

const ProductImageEditor: any = styled.div`
  height: ${(props: any) => props.portfolioMode ? 'auto' : '500px'};
  position: relative;

  .product-background {
    width: 100%;
    position: ${(props: any) => props.portfolioMode ? 'relative' : 'absolute'};
  }
`

const selectedBackgroundKey = 'betuelgroup:selected-product-background';


const productBackgrounds: IProductBackground = {
    betueldance: {
        1: bdBackground1,
        2: bdBackground2,
        3: bdBackground3,
        4: bdBackground4,
    },
    betueltech: {
        1: btBackground1,
    },
    betueltravel: {
        1: btBackground1,
    }
};

const ProductModalForm: React.FC<IProductFormProps> = (
    {
        isOpen,
        toggle,
        loadProducts,
        editProduct,
        handlePromoteProduct,
        promotionLoading,
        portfolioMode,
        company,
    }) => {
    const [product, setProduct] = React.useState<Partial<IProductData>>(editProduct || {});
    const [useCommission, setUseCommission] = React.useState(false);
    const [isValidForm, setIsValidForm] = React.useState(false);
    const [productPhotoName, setProductPhotoName] = React.useState('');
    const [isSubmiting, setIsSubmiting] = React.useState(false);
    const [hideChangeProductPhotoIcon, setHideChangeProductPhotoIcon] = React.useState(false);
    const [increaseNameFont, setIncreaseNameFont] = React.useState(nameInitialFontSize[company]);
    const [productPhoto, setProductPhoto] = React.useState(logo);
    const [productImageFile, setProductImageFile] = React.useState<File | any>();
    const [productImageChanged, setProductImageChanged] = React.useState(false);
    const [enableDropShadow, setEnableDropShadow] = React.useState(false);
    const [selectedBackground, setSelectedBackground] = React.useState();

    // const selectBackground = (bg: 1 | 2 | 3 | 4) => () => {
    //     setSelectedBackground(productBackgrounds[company][bg]);
    //     setFlyerOptions({
    //         ...flyerOptions,
    //         selectedBackground: bg,
    //     })
    // }

    const [flyerOptions, setFlyerOptions] = React.useState<IFlyer>();


    useEffect(() => {
        setProduct(editProduct || {})
        setProductPhoto(editProduct && editProduct.productImage || logo)
        const flyerOptionItem: IFlyer = editProduct && editProduct.flyerOptions ? JSON.parse(editProduct.flyerOptions) : flyerOptions;
        if (flyerOptionItem) {
            flyerOptionItem.value = editProduct;
            setFlyerOptions(flyerOptionItem);
        }

        // const background = (productBackgrounds[company] as any)[flyerOptionItem.selectedBackground || 1];
        // setSelectedBackground(background);
        // setIncreaseNameFont(flyerOptionItem.fontSize || nameInitialFontSize[company]);
        // setEnableDropShadow(!!flyerOptionItem.enableShadow);
        // validForm()
    }, [editProduct])

    const useCommissionChange = async (e: any) => {
        const {checked} = e.target;
        await setUseCommission(checked);
        validForm(checked);
    };

    const enableDropShadowChange = async (e: any) => {
        const {checked} = e.target;
        await setEnableDropShadow(checked);
        // setFlyerOptions({
        //     ...flyerOptions,
        //     enableShadow: checked
        // })
        // validForm()
    };

    const onChangeProduct = async (ev: React.ChangeEvent<any>) => {
        const {name, value, type} = ev.target;
        const finalValue = type === "number" ? Number(value) : value;
        let priceData = {};
        // setting price values when cost is added
        if (name === 'cost') {
            priceData = calculatePrice(Number(value));
        }
        const newProduct = {
            ...product,
            ...priceData,
            [name]: finalValue
        };
        await setProduct(newProduct);
        validForm()
    };

    const onSubmit = async (form: any) => {
        form.preventDefault();
        setIsSubmiting(true);
        // const productImage = productImageChanged ? gcloudPublicURL + productImageFile.name : undefined;
        if (editProduct) {
            // let photoName;
            // if(JSON.stringify(flyerOptions) !== editProduct.flyerOptions || productImageChanged) {
            // photoName = await saveProductPhoto();
            // }

            // const completePhotoName = gcloudPublicURL + photoName;
            const body = JSON.stringify({
                ...product,
                // productImage,
                // company,
                // image: photoName ? completePhotoName : undefined,
                flyerOptions: JSON.stringify(flyerOptions),
            });
            const imageSplited = editProduct.image ? editProduct.image.split('/') : [];
            const productImageSplited = editProduct.productImage ? editProduct.productImage.split('/') : [];
            const photoToDelete = imageSplited[imageSplited.length - 1];
            const productPhotoToDelete = productImageSplited[productImageSplited.length - 1];
            await updateProducts(body, photoName ? photoToDelete || '' : undefined, productImageChanged ? productPhotoToDelete || '' : undefined);
            setIsSubmiting(false);
            loadProducts()
        } else {
            await saveProductPhoto().then(async (photoName?: string) => {
                const body = JSON.stringify({
                    ...product,
                    productImage,
                    company,
                    image: gcloudPublicURL + photoName,
                    flyerOptions: JSON.stringify(flyerOptions),
                });
                await addProduct(body);

                setIsSubmiting(false);
                loadProducts()
            });

        }

        toggleModal();
    }

    const calculatePrice = (cost: number): ICalculatedPrice => {
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

    const internationalNumberFormat = new Intl.NumberFormat('en-US')

    const processPrice = (price: number) => {


        const completeprice = internationalNumberFormat.format(price);
        const dividedPrice = completeprice.split(',');
        let pricePiece: any = dividedPrice[1] || dividedPrice[0];
        // when the number has an cero in front
        let cero = '';
        if (pricePiece.charAt(0) === '0') {
            cero = '0';
        }
        const lastTwo = Number(pricePiece.substring(pricePiece.length - 2));
        if (lastTwo > 50) {
            pricePiece = Number((Number(pricePiece.charAt(0)) + 1) + '00') - 5;
        } else {
            pricePiece = Number(pricePiece.charAt(0) + '48');
        }

        if (dividedPrice[1]) {
            dividedPrice[1] = cero + pricePiece;
        } else {
            dividedPrice[0] = cero + pricePiece;
        }

        return Number(dividedPrice.join(''));
    }

    const decreaseIncreaseNameFont = (minus = false) => () => {
        const value = minus ? increaseNameFont - 1 : increaseNameFont + 1;
        setIncreaseNameFont(value);
        // setFlyerOptions({
        //     ...flyerOptions,
        //     fontSize: value,
        // });
        //
        // validForm();
    }

    const productImageWrapper = useRef<HTMLDivElement>(null)


    const saveProductPhoto = useCallback(async (downloadImage: boolean = false) => {
        const productURLName = product.name ? product.name.split(' ').join('-') : 'flyer';
        const photoName = `${productURLName}-${Date.now()}.png`;
        setProductPhotoName(photoName)

        setHideChangeProductPhotoIcon(true);
        if (productImageWrapper.current === null) {
            return
        }

        await toPng(productImageWrapper.current, {cacheBust: true,})
            .then(async (dataUrl: string) => {
                if (downloadImage) {
                    const a = document.createElement('a') as any;
                    a.href = portfolioMode ? product.image : dataUrl;
                    a.download = photoName;
                    a.click();
                } else {
                    const blob = dataURItoBlob(dataUrl)
                    const file = new File([blob], photoName);
                    await uploadGCloudImage(file);

                    if (productImageChanged && productImageFile) {
                        await uploadGCloudImage(productImageFile)
                    }
                }

                setHideChangeProductPhotoIcon(false);
            })
            .catch((err: any) => {
                console.log(err)
            })
        return photoName;
    }, [productImageWrapper, productImageFile, productImageChanged]);


    const onChangeProductPhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
        const input = event.target;
        const url = event.target.value;
        const ext = '.' + url.substring(url.lastIndexOf('.') + 1).toLowerCase();
        if (input.files && input.files[0]) {
            const reader = new FileReader();

            reader.onload = function (e: any) {
                setProductPhoto(e.target.result)
            }

            reader.readAsDataURL(input.files[0]);
            // renaming file
            const productFile = new File([input.files[0]], Date.now() + ext, {type: input.files[0].type});
            setProductImageFile(productFile);
            setProductImageChanged(true);
        } else {
            setProductPhoto(logo);
        }

        validForm();
    }

    const validForm = (useComissionData?: boolean) => {
        setIsValidForm(['name', 'cost', 'price', 'commission'].map((key: any) => {
            if (key === 'commission') {
                return useCommission || useComissionData ? !!product.commission : true;
            }

            return !!(product as any)[key]
        }).reduce((a, b) => a && b, true));
    };

    const toggleModal = () => {
        setUseCommission(false);
        setProductImageChanged(false);
        toggle();
    }

    const sendWhatsappMessage = () => {
        window.open(getWhatsappMessageURL(`Estoy interesado en este producto "${product.name}". ¿Aún está disponible?  \n \n ${product.image}`), '_blank');
    }

    return (

        <Modal isOpen={isOpen} toggle={toggleModal}>
            {
                !isSubmiting ? null :
                    <>
                        <div className="loading-sale-container">
                            <Spinner animation="grow" variant="secondary"/>
                        </div>
                    </>
            }
            <ModalHeader
                toggle={toggleModal}>{editProduct ? `${!portfolioMode ? 'Editar ' : ''}${editProduct.name}` : 'Crear Producto'}</ModalHeader>
            <Form onSubmit={!isSubmiting && isValidForm ? onSubmit : undefined}>
                {/*<ProductImageEditor portfolioMode={portfolioMode} id="product-image-result" ref={productImageWrapper}>*/}
                {/*    <img src={portfolioMode ? product.image : selectedBackground} alt="bg-image"*/}
                {/*         className="product-background"/>*/}
                {/*    {!portfolioMode && <>*/}

                {/*      <ProductNameSpan fontSize={increaseNameFont}*/}
                {/*                       className={`product-detail-text inset-text ${company}`}>*/}
                {/*        <span>{product.name}</span>*/}
                {/*      </ProductNameSpan>*/}

                {/*      <ProductPriceSpan className={`product-detail-text inset-text ${company}`}>*/}
                {/*        <span style={{fontSize: '35px'}}>RD$</span>*/}
                {/*        <span>{product.cost && internationalNumberFormat.format(product.price || 0)}</span>*/}
                {/*      </ProductPriceSpan>*/}
                {/*      <GodWordSpan className={company} >{product.GodWord || 'Dios te bendiga'}</GodWordSpan>*/}

                {/*      <ProductImageContainer portfolioMode={portfolioMode}>*/}
                {/*          {!hideChangeProductPhotoIcon && <div className="product-arrows">*/}
                {/*              <i className="bi bi-chevron-left"*/}
                {/*                 onClick={selectBackground(flyerOptions.selectedBackground - 1 > 0 ? flyerOptions.selectedBackground - 1 : 4 as any)}/>*/}
                {/*              <i className="bi bi-chevron-right"*/}
                {/*                 onClick={selectBackground(flyerOptions.selectedBackground + 1 <= 4 ? flyerOptions.selectedBackground + 1 : 1 as any)}/>*/}
                {/*          </div>}*/}
                {/*          <Rnd*/}
                {/*          className="rnd-container"*/}
                {/*          size={{width: flyerOptions.width, height: flyerOptions.height}}*/}
                {/*          position={{x: flyerOptions.x, y: flyerOptions.y}}*/}
                {/*          disableDragging={portfolioMode}*/}
                {/*          enableResizing={!portfolioMode}*/}
                {/*          onDragStop={(e, d) => {*/}
                {/*              setFlyerOptions({...flyerOptions, x: d.x, y: d.y});*/}
                {/*              validForm();*/}
                {/*          }}*/}
                {/*          onResize={(e, direction, ref, delta, position) => {*/}
                {/*              setFlyerOptions({*/}
                {/*                  ...flyerOptions,*/}
                {/*                  width: ref.offsetWidth,*/}
                {/*                  height: ref.offsetHeight,*/}
                {/*                  ...position,*/}
                {/*              });*/}
                {/*              validForm();*/}
                {/*          }}*/}
                {/*        >*/}
                {/*          <a href="#" className="position-relative">*/}

                {/*            <ChangePhotoLabel  className={company} htmlFor="product-photo" data-toggle="tooltip" id="change-image"*/}
                {/*                              title="Cambiar Foto del Producto">*/}
                {/*                {!hideChangeProductPhotoIcon && <i className="bi bi-images"/>}*/}
                {/*            </ChangePhotoLabel>*/}
                {/*            <input type="file" id="product-photo" className="invisible position-absolute"*/}
                {/*                   onChange={onChangeProductPhoto} accept="image/png, image/gif, image/jpeg"/>*/}

                {/*            <img src={productPhoto} className={`${enableDropShadow ? 'image-drop-shadow' : ''}`}*/}
                {/*                 alt="" width="100%"*/}
                {/*                 height="100%"/>*/}
                {/*          </a>*/}
                {/*        </Rnd>*/}
                {/*      </ProductImageContainer>*/}
                {/*    </>*/}
                {/*    }*/}
                {/*</ProductImageEditor>*/}
                <FlyerDesigner onChangeFlyer={value => console.log(value)} flyerOptions={flyerOptions} templateId="644995b166af5e000808140c" />
                <ModalBody>

                    {
                        editProduct && !portfolioMode ?
                            <div className="d-flex align-items-center justify-content-center my-3">
                                <PromotionOption loading={promotionLoading.facebook}>
                                    <Spinner className="loading-spinner" animation="grow" variant="secondary"
                                             size="sm"/>
                                    <i data-toggle="tooltip"
                                       title={`Publicar ${product.name} en Facebook Marketplace`}
                                       className="bi bi-facebook text-info cursor-pointer promotion-icon facebook-icon"
                                       onClick={!promotionLoading.facebook ? handlePromoteProduct('facebook') : undefined}
                                    />
                                </PromotionOption>
                                <PromotionOption loading={promotionLoading.flea}>
                                    <Spinner className="loading-spinner" animation="grow" variant="secondary"
                                             size="sm"/>
                                    <img
                                        src={FleaFavicon}
                                        data-toggle="tooltip"
                                        title={`Publicar ${product.name} en La Pulga Virtual`}
                                        className="text-info cursor-pointer promotion-icon img-promotion-icon"
                                        onClick={!promotionLoading.flea ? handlePromoteProduct('flea') : undefined}
                                    />
                                </PromotionOption>
                                <PromotionOption loading={promotionLoading.corotos}>
                                    <Spinner className="loading-spinner" animation="grow" variant="secondary"
                                             size="sm"/>
                                    <img
                                        src={CorotosFavicon}
                                        data-toggle="tooltip"
                                        title={`Publicar ${product.name} en Corotos`}
                                        className="text-info cursor-pointer promotion-icon img-promotion-icon"
                                        onClick={!promotionLoading.corotos ? handlePromoteProduct('corotos') : undefined}
                                    />
                                </PromotionOption>
                            </div> : null}
                    {!portfolioMode &&
                        <div className="d-flex justify-content-center">
                            <Input
                                id="first2"
                                type="switch"
                                label="Colocar Sombra"
                                checked={enableDropShadow}
                                className="customized-switch"
                                onChange={enableDropShadowChange}/>
                        </div>}
                    <div className="d-flex justify-content-between">
                        <Button color="primary" className="mb-3" outline onClick={() => saveProductPhoto(true)}>Descargar
                            Imagen</Button>
                        {
                            editProduct ?
                                <Button color="success" className="mb-3 d-flex align-items-center" outline
                                        onClick={sendWhatsappMessage}>
                                        <span className="me-2">
                                            Pedir por Whatsapp
                                        </span>
                                    <i className="bi bi-whatsapp"/>
                                </Button> : null}
                    </div>
                    {portfolioMode && <pre className="mt-3">{product.description}</pre>}
                    {!portfolioMode && <>
                        <FormGroup>
                            <Label for="name">Nombre:</Label>
                            <div className="d-flex align-items-center">
                                <Input onChange={onChangeProduct} name="name" id="name"
                                       value={product.name}/>
                                <span className="d-flex align-items-center" style={{fontSize: '21px'}}>
                                <i className="bi-dash mx-3 cursor-pointer" onClick={decreaseIncreaseNameFont(true)}/>
                                <i className="bi-plus cursor-pointer" onClick={decreaseIncreaseNameFont()}/>
                            </span>
                            </div>
                        </FormGroup>
                        <FormGroup>
                            <Label for="GodWord">Palabra de Dios:</Label>
                            <Input onChange={onChangeProduct} type="text" name="GodWord" id="GodWord"
                                   value={product.GodWord}/>
                        </FormGroup>
                        <FormGroup>
                            <Label for="cost">Costo:</Label>
                            <Input onChange={onChangeProduct} type="number" name="cost" id="cost"
                                   value={product.cost}/>
                        </FormGroup>
                        <FormGroup>
                            <Label for="priceId">Precio:</Label>
                            <Input disabled={!product.cost} onChange={onChangeProduct} type="number" name="price"
                                   id="priceId"
                                   value={product.cost ? product.price : 0}/>
                        </FormGroup>
                        <FormGroup>
                            <Label for="priceId">Cantidad:</Label>
                            <Input onChange={onChangeProduct} type="number" name="stock"
                                   id="stockId"
                                   value={product.stock}/>
                        </FormGroup>
                        <FormGroup>
                            <Label for="productImage">Descripción:</Label>
                            <textarea rows={5}
                                      name="description"
                                      id="description"
                                      className="form-control"
                                      value={product.description}
                                      onChange={onChangeProduct}/>
                        </FormGroup>
                        <>
                            <Input
                                id="first"
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
                    </>}
                </ModalBody>
                {!portfolioMode &&
                    <ModalFooter>
                        <Button color="danger" onClick={toggleModal} outline>Cancel</Button>{' '}
                        <Button color={isSubmiting || !isValidForm ? 'dark' : 'primary'} outline type="submit"
                                disabled={isSubmiting || !isValidForm}>{editProduct ? 'Actualizar' : 'Añadir'}</Button>
                    </ModalFooter>
                }
            </Form>
        </Modal>
    )
}

export default ProductModalForm;
