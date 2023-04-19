import {Position, ResizableDelta, Rnd} from "react-rnd";
import React, {useCallback, useRef} from "react";
import {IProductData} from "../../model/products";
import {CompanyTypes} from "../../model/common";
import logo from "../../assets/images/betueltech.png";
import {toPng} from "html-to-image";
import {dataURItoBlob} from "../../utils/blob";
import {uploadPhoto} from "../../services/gcloud";
import {
    IFlyer,
    FlyerElement,
    IFlyerElementPosition,
    IFlyerElementTemporaryFile, FlyerElementTypes
} from "../../model/interfaces/FlyerDesigner.interfaces";
import "./FlyerDesigner.scss";
import {ResizeDirection} from "re-resizable";
import ContentEditable from "react-contenteditable";
import {Button} from "reactstrap";


export interface IFlyerDesignerProps {
    product: IProductData;
    editProduct: IProductData;
    company: CompanyTypes;
    validForm: (useComissionData?: boolean) => any;
}


const FlyerDesigner = ({product, company, validForm, editProduct}: IFlyerDesignerProps) => {
    const [flyer, setFlyer] = React.useState<IFlyer>({} as IFlyer);
    const [hideChangeProductPhotoIcon, setHideChangeProductPhotoIcon] = React.useState(false);
    const [productPhotoName, setProductPhotoName] = React.useState('');
    const [productPhoto, setProductPhoto] = React.useState(logo);
    const [productImageFile, setProductImageFile] = React.useState<File | any>();
    const [productImageChanged, setProductImageChanged] = React.useState(false);

    const productImageWrapper = useRef<HTMLDivElement>(null)
    const portfolioMode = false;

    const changeFlyerElementProps = (index: number, value: Partial<FlyerElement>) => {
        const newFlyerElements: FlyerElement[] = flyer.elements.map((element, i) => {
            if (i === index) {
                return {
                    ...element,
                    ...value
                }
            }
            return element;
        });

        setFlyer({
            ...flyer,
            elements: newFlyerElements
        })
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


    const onChangeElementImage = (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log(index, "index");
        const input = event.target;
        const url = event.target.value;
        const ext = '.' + url.substring(url.lastIndexOf('.') + 1).toLowerCase();

        if (input.files && input.files[0]) {
            const productFile = new File([input.files[0]], Date.now() + ext, {type: input.files[0].type});
            const reader = new FileReader();
            const temporaryFiles = flyer.elements[index].temporaryFiles ? flyer.elements[index].temporaryFiles : [] as any;
            reader.onload = function (e: any) {
                changeFlyerElementProps(index, {
                    content: e.target.result,
                    temporaryFiles: [...temporaryFiles, {type: 'image', file: productFile}]
                });
            }

            reader.readAsDataURL(input.files[0]);
            // renaming file
        } else {
            setProductPhoto(logo);
        }

    }


    React.useEffect(() => {
        setFlyer({
            elements: [
                {
                    type: 'text',
                    position: {x: 30, y: 40},
                    content: 'Betuel Dance',
                    size: {fontSize: 21, width: 'auto', height: 'auto'},
                    color: {text: 'red'},
                    fontFamily: 'Roboto',
                    // border: {color: 'red', width: 2, type: 'solid', radius: 0},
                    padding: 30,
                    backgroundImage: "https://png.pngtree.com/png-vector/20220723/ourmid/pngtree-golden-circle-frame-with-luxury-leaves-ornament-design-png-image_6034826.png",
                },
                {
                    type: 'image',
                    position: {x: 50, y: 30},
                    content: 'https://media.istockphoto.com/id/1217828258/photo/grey-stripped-mixed-breed-cat-sitting-isolated-on-white.jpg?s=612x612&w=0&k=20&c=ZdsQKhn9NqMm8KQ-AlpT7D7E0SBv9pNJF-Sbs-j91R0=',
                    size: {width: 100, height: 100},
                    border: {color: '#000', width: 5, type: 'solid'},
                },
                {
                    type: 'image',
                    position: {x: 200, y: 200},
                    content: 'https://media.istockphoto.com/id/1217828258/photo/grey-stripped-mixed-breed-cat-sitting-isolated-on-white.jpg?s=612x612&w=0&k=20&c=ZdsQKhn9NqMm8KQ-AlpT7D7E0SBv9pNJF-Sbs-j91R0=',
                    size: {width: 100, height: 100},
                    border: {color: 'red', width: 5, type: 'solid'},
                },
            ],
            canvaSize: {
                width: 500, height: 500
            },
            templateUrl: 'https://scontent.fhex5-1.fna.fbcdn.net/v/t39.30808-6/279859380_510172334169053_8980077003497225708_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=a26aad&_nc_ohc=Hpl83XD0K1oAX-A-sNQ&_nc_oc=AQnE3zi4Jl5uyto8MgBt_fwLLBVgVpOUWTvxMDdrzoWnNDXcmHOJjIbUOZrxHYl86sk&_nc_ht=scontent.fhex5-1.fna&oh=00_AfDAykmFAEvgo1tznAn-LPa8V8O6tt7OmIJQ--IoimYF3Q&oe=643E8A91'
        })
    }, []);


    const onDragElementStop = (index: number) => (e: any, position: IFlyerElementPosition) => {
        changeFlyerElementProps(index, {position})
    };

    const onResizeElement = (index: number) => (e: any, dir: ResizeDirection, elementRef: HTMLElement, size: ResizableDelta, position: Position) => {
        changeFlyerElementProps(index, {
            position, size: {
                width: elementRef.offsetWidth,
                height: elementRef.offsetHeight,
            }
        });
    };

    const onChangeElementText = (index: number) => ({target: {value}}: React.ChangeEvent<any>) => {
        changeFlyerElementProps(index, {content: value});
    };

    const addFlyerElement = (type: FlyerElementTypes) => () => {
        const newElement = new FlyerElement({type})

        setFlyer({
            ...flyer,
            elements: [
                ...flyer.elements,
                newElement,
            ]
        })
    }
    return (
        <div className="w-100 h-100 d-flex justify-content-center align-items-center"
             style={{width: "100vw", height: "100vh"}}>
            <div className="flyer-designer">
                <div className="flyer" id="product-image-result" ref={productImageWrapper}>
                    <img src={flyer.templateUrl} alt=""
                         className="flyer-designer-background-image"/>
                    {flyer.elements?.map((element, i) =>
                        (
                            <Rnd className="flyer-element"
                                 position={{x: element.position.x, y: element.position.y}}
                                 size={{width: element.size.width, height: element.size.height}}
                                 onDragStop={onDragElementStop(i)}
                                 onResize={onResizeElement(i)}
                                 style={{
                                     fontSize: element.size?.fontSize,
                                     color: element.color?.text,
                                     backgroundColor: element.color?.background,
                                     padding: element.padding,
                                     borderRadius: element.border?.radius,
                                     borderColor: element.border?.color,
                                     borderStyle: element.border?.type,
                                     borderWidth: element.border?.width,
                                     backgroundImage: `url(${element.backgroundImage})`,
                                 }}>

                                {
                                    element.type === 'text' ?
                                        <ContentEditable
                                            html={element.content} // innerHTML of the editable div
                                            onChange={onChangeElementText(i)} // handle innerHTML change
                                        />
                                        :
                                        <>
                                            <label htmlFor="product-photo">
                                                <i className="bi bi-images flyer-element-change-image-action"/>
                                                {console.log("index", i)}
                                                <input type="file" id="product-photo"
                                                       className="invisible position-absolute"
                                                       onChange={onChangeElementImage(i)}
                                                       accept="image/png, image/gif, image/jpeg"/>
                                            </label>
                                            <img
                                                src={element.content}
                                                width={element.size.width}
                                                height={element.size.height}
                                                style={{
                                                    borderRadius: element.border?.radius,
                                                    borderColor: element.border?.color,
                                                    borderStyle: element.border?.type,
                                                    borderWidth: element.border?.width,
                                                }}
                                            />
                                        </>
                                }
                            </Rnd>
                        )
                    )}
                </div>
                <div className="flyer-designer-actions">
                    <Button onClick={addFlyerElement('text')}>Add Text</Button>
                    <Button onClick={addFlyerElement('image')}>Add Image</Button>
                </div>
            </div>
        </div>
    )
}

export default FlyerDesigner;
