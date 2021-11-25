import {
    Button,
    CustomInput, Form,
    FormGroup,
    Input,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader, Spinner, Tooltip,
} from "reactstrap";
import React, { useCallback, useRef } from "react";
import { IProductData } from "../../model/products";
import { Rnd } from 'react-rnd';
import logo from "../../assets/images/logo.png";
import productBackground from "../../assets/images/product-background.png";
import styled from "styled-components";
import "./ProductForm.scss";
import { toPng } from 'html-to-image';
import { dataURItoBlob } from "../../utils/blob";
import { gcloudPublicURL, uploadPhoto } from "../../services/gcloud";
import { addProduct } from "../../services/products";

const draggableWidth = 350;
const draggableHeight = 350;
const nameInitialFontSize = 30;

export interface ICalculatedPrice {
    price: number;
    wholeSale: string;
}

export interface IProductFormProps {
    toggle: () => any;
    loadProducts: () => any;
    isOpen?: boolean;
}

export interface IProductImageProperties {
    width: number;
    height: number;
    x: number;
    y: number;
}

const ProductNameSpan: any = styled.span`
   position: absolute;
   bottom: 15px;
   font-size: ${(props: any) => props.fontSize || nameInitialFontSize}px;
   z-index: 999;
   transform: translate(15px, 0px);
   max-width: 206px;
   line-height:  ${(props: any) => props.fontSize || nameInitialFontSize}px;
`;

const ChangePhotoLabel: any = styled.label`
   position: absolute;
   top: -17px;
   right: -35px;
   color: #ababab;
   cursor: pointer;
   font-size: 35px;
`;
const ProductPriceSpan = styled.span`
 position: absolute;
 bottom: 30px;
 font-size: ${(props: any) => props.fontSize || 85}px;
 line-height:  ${(props: any) => props.fontSize || 85}px;
 z-index: 999; 
 right: 15px;
  
`;

const GodWordSpan = styled.span`
 position: absolute;
 bottom: 15px;
 right: 15px;
 font-size: ${(props: any) => props.fontSize || 25}px;
 z-index: 999;
 color: #c3c3c3;
 
`;

const ProductImageContainer = styled.div`
  position: absolute;
  z-index: 999;
  width: 100%;
  height: 100%;
  .rnd-container {
    a:focus > img {
      border: 3px dashed #ababab;
    }
  }
`

const ProductImageEditor = styled.div`
  height: 500px;
  position: relative;
 .product-background {
    width: 100%;
    position: absolute;
 }
`

const ProductForm: React.FC<IProductFormProps> = (
    {
        isOpen,
        toggle,
        loadProducts,
    }) => {
    const [product, setProduct] = React.useState<Partial<IProductData>>({
        name: 'Replica Exacta Clase A - Serie 2',
        price: 2500
    });
    const [useCommission, setUseCommission] = React.useState(false);
    const [isValidForm, setIsValidForm] = React.useState(false);
    const [productPhotoName, setProductPhotoName] = React.useState('');
    const [isSubmiting, setIsSubmiting] = React.useState(false);
    const [hideChangeProductPhotoIcon, setHideChangeProductPhotoIcon] = React.useState(false);
    const [increaseNameFont, setIncreaseNameFont] = React.useState(nameInitialFontSize);
    const [productPhoto, setProductPhoto] = React.useState(logo);
    const [productImageProperties, setProductImageProperties] = React.useState<IProductImageProperties>({
        width: draggableWidth,
        height: draggableHeight,
        x: 70,
        y: 40
    } as any);


    const useCommissionChange = async (e: any) => {
        const {checked} = e.target;
        await setUseCommission(checked);
        validForm(checked);
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
        await saveProductPhoto().then(async (photoName?: string) => {
            await addProduct(JSON.stringify({...product, image: gcloudPublicURL + photoName }));
            setIsSubmiting(false);
            loadProducts()
        });


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
        const lastTwo = Number(pricePiece.substring(pricePiece.length - 2));
        if (lastTwo > 50) {
            pricePiece = Number((Number(pricePiece.charAt(0)) + 1) + '00') - 5;
        } else {
            pricePiece = Number(pricePiece.charAt(0) + '48');
        }

        if (dividedPrice[1]) {
            dividedPrice[1] = pricePiece;
        } else {
            dividedPrice[0] = pricePiece;
        }

        return Number(dividedPrice.join(''));
    }

    const decreaseIncreaseNameFont = (minus = false) => () => {
        setIncreaseNameFont(minus ? increaseNameFont - 1 : increaseNameFont + 1);
    }

    const productImageWrapper = useRef<HTMLDivElement>(null)


    const saveProductPhoto = useCallback(async () => {
        const productURLName = product.name ? product.name.split(' ').join('-'): product.name;
        const photoName = `${productURLName}-${Date.now()}.png`;
        setProductPhotoName(photoName)

        setHideChangeProductPhotoIcon(true);
        if (productImageWrapper.current === null) {
            return
        }

        await toPng(productImageWrapper.current, {cacheBust: true,})
            .then(async (dataUrl: string) => {
                const blob = dataURItoBlob(dataUrl)
                const file = new File([blob], photoName);
                await uploadPhoto(file);
                setHideChangeProductPhotoIcon(false);
            })
            .catch((err: any) => {
                console.log(err)
            })
        return photoName;
    }, [productImageWrapper]);



    const onChangeProductPhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
        const input = event.target;
        const url = event.target.value;
        const ext = url.substring(url.lastIndexOf('.') + 1).toLowerCase();
        if (input.files && input.files[0]) {
            const reader = new FileReader();

            reader.onload = function (e: any) {
                setProductPhoto(e.target.result)
            }
            reader.readAsDataURL(input.files[0]);
        } else {
            setProductPhoto(logo);
        }
    }

    const validForm = (useComissionData?: boolean) => {
         setIsValidForm(['name', 'cost', 'price', 'commission'].map((key: any) => {
            if(key === 'commission') {
                return useCommission || useComissionData ? !!product.commission : true;
            }

            return !!(product as any)[key]
        }).reduce((a,b)=> a && b, true));
    };

    return (

        <Modal isOpen={isOpen} toggle={toggle}>
            {
                !isSubmiting ? null :
                    <>
                        <div className="loading-sale-container">
                            <Spinner animation="grow" variant="secondary"/>
                        </div>
                    </>
            }
            <ModalHeader toggle={toggle}>{'New Product'}</ModalHeader>
            <Form onSubmit={onSubmit}>
                <ProductImageEditor id="product-image-result" ref={productImageWrapper}>
                    <img src={productBackground} alt="bg-image" className="product-background"/>
                    <ProductNameSpan fontSize={increaseNameFont}
                                     className="product-detail-text inset-text">
                        <span>{product.name}</span>
                    </ProductNameSpan>

                    <ProductPriceSpan className="product-detail-text inset-text">
                        <span style={{fontSize: '40px'}}>RD$</span>
                        <span>{product.cost && internationalNumberFormat.format(product.price || 0)}</span>
                    </ProductPriceSpan>

                    <GodWordSpan>Dios te bendiga</GodWordSpan>
                    <ProductImageContainer>
                        <Rnd
                            className="rnd-container"
                            size={{width: productImageProperties.width, height: productImageProperties.height}}
                            position={{x: productImageProperties.x, y: productImageProperties.y}}
                            onDragStop={(e, d) => {
                                setProductImageProperties({...productImageProperties, x: d.x, y: d.y});
                            }}
                            onResize={(e, direction, ref, delta, position) => {
                                setProductImageProperties({
                                    width: ref.offsetWidth,
                                    height: ref.offsetHeight,
                                    ...position,
                                });
                            }}
                        >
                            <a href="#" className="position-relative">
                                <ChangePhotoLabel htmlFor="product-photo" data-toggle="tooltip" id="change-image"
                                                  title="Cambiar Foto del Producto">
                                    {!hideChangeProductPhotoIcon && <i className="bi bi-images"/>}
                                </ChangePhotoLabel>
                                <input type="file" id="product-photo" className="invisible"
                                       onChange={onChangeProductPhoto}/>
                                <img src={productPhoto} alt="" width="100%" height="100%"/>
                            </a>
                        </Rnd>
                    </ProductImageContainer>
                </ProductImageEditor>

                <ModalBody>
                    <Button color="primary" outline onClick={saveProductPhoto}>Process Image</Button>
                    <FormGroup>
                        <Label for="name">Nombre:</Label>
                        <div className="d-flex align-items-center">
                            <Input onChange={onChangeProduct} name="name" id="name"
                                   value={product.name}/>
                            <span className="d-flex align-items-center" style={{fontSize: '21px'}}>
                               <i className="bi-plus mx-3 cursor-pointer" onClick={decreaseIncreaseNameFont()}/>
                               <i className="bi-dash cursor-pointer" onClick={decreaseIncreaseNameFont(true)}/>
                            </span>
                        </div>
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
                        <Label for="productImage">File:</Label>
                        {/*<Input type="file" name="product-image" id="productImage" onChange={uploadPhoto}/>*/}
                    </FormGroup>
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
                    <Button color={isSubmiting || !isValidForm ? 'dark' : 'primary'} outline type="submit"
                            disabled={isSubmiting || !isValidForm}>Añadir</Button>{' '}
                    <Button color="secondary" onClick={toggle}>Cancel</Button>
                </ModalFooter>
            </Form>
        </Modal>
    )
}

export default ProductForm;
