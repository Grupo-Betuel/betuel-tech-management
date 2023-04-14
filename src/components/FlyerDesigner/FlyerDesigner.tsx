import {Rnd} from "react-rnd";
import React, {useCallback, useEffect, useRef} from "react";
import styled from "styled-components";
import {IProductBackground, IProductData} from "../../model/products";
import {CompanyTypes} from "../../model/common";
import {IProductImageProperties} from "../ProductModalForm/ProductModalForm";
import logo from "../../assets/images/betueltech.png";
import bdBackground1 from "../../assets/images/betueldance/Fondo1.png";
import bdBackground2 from "../../assets/images/betueldance/Fondo2.png";
import bdBackground3 from "../../assets/images/betueldance/Fondo3.png";
import bdBackground4 from "../../assets/images/betueldance/Fondo4.png";
import btBackground1 from "../../assets/images/product-background.png";
import {toPng} from "html-to-image";
import {dataURItoBlob} from "../../utils/blob";
import {uploadPhoto} from "../../services/gcloud";

const ProductImageEditor: any = styled.div`
  height: ${(props: any) => props.portfolioMode ? 'auto' : '500px'};
  position: relative;

  .product-background {
    width: 100%;
    position: ${(props: any) => props.portfolioMode ? 'relative' : 'absolute'};
  }
`
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
const selectedBackgroundKey = 'betuelgroup:selected-product-background';

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

const draggableWidth = 300;

const draggableHeight = 300;


export interface IFlyerDesignerProps {
    product: IProductData;
    editProduct: IProductData;
    company: CompanyTypes;
    validForm: (useComissionData?: boolean) => any;
}

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

const nameInitialFontSize: { [N in CompanyTypes]: number} = {
    betueldance: 80,
    betueltech: 30,
    betueltravel: 30,
};

const FlyerDesigner = ({product, company, validForm, editProduct}: IFlyerDesignerProps) => {
    const [increaseNameFont, setIncreaseNameFont] = React.useState(nameInitialFontSize[company]);
    const [selectedBackground, setSelectedBackground] = React.useState();
    const [hideChangeProductPhotoIcon, setHideChangeProductPhotoIcon] = React.useState(false);
    const [productPhotoName, setProductPhotoName] = React.useState('');
    const [productPhoto, setProductPhoto] = React.useState(logo);
    const [productImageFile, setProductImageFile] = React.useState<File | any>();
    const [productImageChanged, setProductImageChanged] = React.useState(false);
    const [enableDropShadow, setEnableDropShadow] = React.useState(false);

    const productImageWrapper = useRef<HTMLDivElement>(null)
    const portfolioMode = false;
    const internationalNumberFormat = new Intl.NumberFormat('en-US')
    const [flyerOptions, setFlyerOptions] = React.useState<IProductImageProperties>({
        width: draggableWidth,
        height: draggableHeight,
        x: 90,
        y: 90
    } as any);
    const selectBackground = (bg: 1 | 2 | 3 | 4) => () => {
        setSelectedBackground(productBackgrounds[company][bg]);
        setFlyerOptions({
            ...flyerOptions,
            selectedBackground: bg,
        })
    }

    useEffect(() => {
        const flyerOptionItem: IProductImageProperties = editProduct && editProduct.flyerOptions ? JSON.parse(editProduct.flyerOptions) : flyerOptions;
        setFlyerOptions(flyerOptionItem);
        const background = (productBackgrounds[company] as any)[flyerOptionItem.selectedBackground || 1];
        setSelectedBackground(background);
        setIncreaseNameFont(flyerOptionItem.fontSize || nameInitialFontSize[company]);
        setEnableDropShadow(!!flyerOptionItem.enableShadow);
        validForm()
    }, [editProduct])

    const decreaseIncreaseNameFont = (minus = false) => () => {
        const value = minus ? increaseNameFont - 1 : increaseNameFont + 1;
        setIncreaseNameFont(value);
        setFlyerOptions({
            ...flyerOptions,
            fontSize: value,
        });

        validForm();
    }

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
                    await uploadPhoto(file);

                    if (productImageChanged && productImageFile) {
                        await uploadPhoto(productImageFile)
                    }
                }

                setHideChangeProductPhotoIcon(false);
            })
            .catch((err: any) => {
                console.log(err)
            })
        return photoName;
    }, [productImageWrapper, productImageFile, productImageChanged]);


    const enableDropShadowChange = async (e: any) => {
        const {checked} = e.target;
        await setEnableDropShadow(checked);
        setFlyerOptions({
            ...flyerOptions,
            enableShadow: checked
        })
        validForm()
    };

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


    return (
        <ProductImageEditor portfolioMode={false} id="product-image-result" ref={productImageWrapper}>
            <img src={portfolioMode ? product.image : selectedBackground} alt="bg-image"
                 className="product-background"/>
            {!portfolioMode && <>

                <ProductNameSpan fontSize={increaseNameFont}
                                 className={`product-detail-text inset-text ${company}`}>
                    <span>{product.name}</span>
                </ProductNameSpan>

                <ProductPriceSpan className={`product-detail-text inset-text ${company}`}>
                    <span style={{fontSize: '35px'}}>RD$</span>
                    <span>{product.cost && internationalNumberFormat.format(product.price || 0)}</span>
                </ProductPriceSpan>
                <GodWordSpan className={company}>{product.GodWord || 'Dios te bendiga'}</GodWordSpan>

                <ProductImageContainer portfolioMode={portfolioMode}>
                    {!hideChangeProductPhotoIcon && <div className="product-arrows">
                        <i className="bi bi-chevron-left"
                           onClick={selectBackground(flyerOptions.selectedBackground - 1 > 0 ? flyerOptions.selectedBackground - 1 : 4 as any)}/>
                        <i className="bi bi-chevron-right"
                           onClick={selectBackground(flyerOptions.selectedBackground + 1 <= 4 ? flyerOptions.selectedBackground + 1 : 1 as any)}/>
                    </div>}
                    <Rnd
                        className="rnd-container"
                        size={{width: flyerOptions.width, height: flyerOptions.height}}
                        position={{x: flyerOptions.x, y: flyerOptions.y}}
                        disableDragging={portfolioMode}
                        enableResizing={!portfolioMode}
                        onDragStop={(e, d) => {
                            setFlyerOptions({...flyerOptions, x: d.x, y: d.y});
                            validForm();
                        }}
                        onResize={(e, direction, ref, delta, position) => {
                            setFlyerOptions({
                                ...flyerOptions,
                                width: ref.offsetWidth,
                                height: ref.offsetHeight,
                                ...position,
                            });
                            validForm();
                        }}
                    >
                        <a href="#" className="position-relative">

                            <ChangePhotoLabel className={company} htmlFor="product-photo" data-toggle="tooltip"
                                              id="change-image"
                                              title="Cambiar Foto del Producto">
                                {!hideChangeProductPhotoIcon && <i className="bi bi-images"/>}
                            </ChangePhotoLabel>
                            <input type="file" id="product-photo" className="invisible position-absolute"
                                   onChange={onChangeProductPhoto} accept="image/png, image/gif, image/jpeg"/>

                            <img src={productPhoto} className={`${enableDropShadow ? 'image-drop-shadow' : ''}`}
                                 alt="" width="100%"
                                 height="100%"/>
                        </a>
                    </Rnd>
                </ProductImageContainer>
            </>
            }
        </ProductImageEditor>
    )
}

export default FlyerDesigner;
