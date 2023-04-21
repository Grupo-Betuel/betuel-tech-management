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
    FlyerElementTypes
} from "../../model/interfaces/FlyerDesigner.interfaces";
import "./FlyerDesigner.scss";
import {ResizeDirection} from "re-resizable";
import ContentEditable from "react-contenteditable";
import {
    Button, FormGroup,
    Input,
    InputGroup,
    Label,
    ListGroup,
    ListGroupItem,
    Popover,
    PopoverBody,
    PopoverHeader
} from "reactstrap";
import _ from "lodash";
import {Card, CardGrid} from "../Card/Card";


const fonts = ['Reey Regular', 'Rockwell Extra Bold']
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
    const [editBorderItemPanelIsOpen, setEditBorderItemPanelIsOpen] = React.useState<boolean>();
    const [editStrokeItemPanelIsOpen, setEditStrokeItemPanelIsOpen] = React.useState<boolean>();

    const productImageWrapper = useRef<HTMLDivElement>(null)
    const portfolioMode = false;

    const changeFlyerElementProps = (id: number, value: Partial<FlyerElement>) => {
        const newFlyerElements: FlyerElement[] = flyer.elements.map((element) => {
            if (element.id === id) {
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


    const onChangeElementImage = (id: number, type: 'content' | 'backgroundImage' = 'content') => (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log(id, "img id");
        const input = event.target;
        const url = event.target.value;
        const ext = '.' + url.substring(url.lastIndexOf('.') + 1).toLowerCase();

        if (input.files && input.files[0]) {
            const productFile = new File([input.files[0]], Date.now() + ext, {type: input.files[0].type});
            const reader = new FileReader();
            const element = flyer.elements.find(item => item.id === id) || {} as any;
            const temporaryFiles = element.temporaryFiles || [];
            reader.onload = function (e: any) {
                changeFlyerElementProps(id, {
                    [type]: e.target.result,
                    temporaryFiles: [...temporaryFiles, {
                        type: type === "backgroundImage" ? 'background' : 'image',
                        file: productFile
                    }]
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
                    id: 1,
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
                    id: 2,
                    type: 'image',
                    position: {x: 50, y: 30},
                    content: 'https://media.istockphoto.com/id/1217828258/photo/grey-stripped-mixed-breed-cat-sitting-isolated-on-white.jpg?s=612x612&w=0&k=20&c=ZdsQKhn9NqMm8KQ-AlpT7D7E0SBv9pNJF-Sbs-j91R0=',
                    size: {width: 100, height: 100},
                    border: {color: '#000', width: 5, style: 'solid'},
                },
                {
                    id: new Date().getTime(),
                    type: 'image',
                    position: {x: 200, y: 200},
                    content: 'https://media.istockphoto.com/id/1217828258/photo/grey-stripped-mixed-breed-cat-sitting-isolated-on-white.jpg?s=612x612&w=0&k=20&c=ZdsQKhn9NqMm8KQ-AlpT7D7E0SBv9pNJF-Sbs-j91R0=',
                    size: {width: 100, height: 100},
                    border: {color: 'red', width: 5, style: 'solid'},
                },
            ],
            canvaSize: {
                width: 500, height: 500
            },
            templateUrl: 'https://scontent.fhex5-1.fna.fbcdn.net/v/t39.30808-6/279859380_510172334169053_8980077003497225708_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=a26aad&_nc_eui2=AeE3e-p2VLyQNSRIvKmMZT-uN_5BMfy_BRo3_kEx_L8FGiqBrIqMNEHkX3Vgsg4VwnIqqQ2s6KICLcmGHYu5Evsz&_nc_ohc=XChULcaz34MAX-K1sGn&_nc_oc=AQlpTCBn_xCOLpyGiRYxqsPeb4Xhfk0kaUPa49eI9GCDr9D7Y8y3oyiNjjy8MvTZXNc&_nc_ht=scontent.fhex5-1.fna&oh=00_AfAbK2r_cMPbj873LmE4DwULza2kOY4SDotfXRABX5PTnw&oe=64447951'
        })
    }, []);


    const onDragElementStop = (id: number) => (e: any, position: IFlyerElementPosition) => {
        changeFlyerElementProps(id, {position})
    };

    const onResizeElement = (id: number) => (e: any, dir: ResizeDirection, elementRef: HTMLElement, size: ResizableDelta, position: Position) => {
        const element = flyer.elements.find(item => item.id === id) || {} as any;
        changeFlyerElementProps(id, {
            position, size: {
                ...element.size,
                width: elementRef.offsetWidth,
                height: elementRef.offsetHeight,
            }
        });
    };

    const onChangeElementText = (id: number) => ({target: {value}}: React.ChangeEvent<any>) => {
        changeFlyerElementProps(id, {content: value});
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

    const toggleEditBorderItemPanel = () => {
        setEditBorderItemPanelIsOpen(!editBorderItemPanelIsOpen);
    }
    const toggleEditStrokeItemPanel = () => {
        setEditStrokeItemPanelIsOpen(!editStrokeItemPanelIsOpen);
    }


    const [selectedElement, setSelectedElement] = React.useState<FlyerElement>(new FlyerElement());
    const onChangeee = () => {
        // const domElement = document.getElementById(String(selectedElement.id));
        // if (!domElement) return;
        // const lastStrokeClass = `text-stroke-${value - 1}`;
        // const newStrokeClass = `text-stroke-${value + 1}`;
        // domElement.classList.remove(lastStrokeClass);
        // domElement.classList.add(newStrokeClass);
        // domElement.style.setProperty('--text-stroke-color', value);
    }

    const onChangeFlyerElementProps = ({target: {value, name, type}}: React.ChangeEvent<HTMLInputElement>) => {

        console.log("vals", value, name, type);
        if (type === 'number') {
            value = Number(value) as any;
        }

        // eslint-disable-next-line no-undef
        const changedElement = selectedElement;
        console.log("changed => ", changedElement)
        _.set<FlyerElement>(changedElement, name, value);
        changeFlyerElementProps(changedElement.id, changedElement);
    }

    const selectElement = (element: FlyerElement) => () => setSelectedElement(element);

    const setColor = () => {
    }

    // @ts-ignore
    return (
        <div className="w-100 h-100 d-flex justify-content-center align-items-center"
             style={{width: "100vw", height: "100vh"}}>
            <div className="flyer-designer">
                <button onClick={setColor}>Change color</button>
                <div className="flyer" id="product-image-result" ref={productImageWrapper}>
                    <img src={flyer.templateUrl} alt=""
                         className="flyer-designer-background-image"/>
                    {flyer.elements?.map((element, i) =>
                        (
                            <Rnd className={`flyer-element ${selectedElement.id === element.id ? 'selected' : ''} text-stroke-${element.stroke?.width}`}
                                 id={element.id}
                                 onClick={selectElement(element)}
                                 key={i}
                                 position={{x: element.position.x, y: element.position.y}}
                                 size={{width: element.size.width, height: element.size.height}}
                                 onDragStop={onDragElementStop(element.id)}
                                 onResize={onResizeElement(element.id)}
                                 style={{
                                     // @ts-ignore
                                     '--text-stroke-color': element.stroke?.color || 'transparent',
                                     fontSize: element.size?.fontSize,
                                     fontFamily: element.fontFamily,
                                     color: element.color?.text,
                                     backgroundColor: element.color?.background,
                                     padding: element.padding,
                                     borderRadius: element.border?.radius,
                                     borderColor: element.border?.color,
                                     borderStyle: element.border?.style,
                                     borderWidth: element.border?.width,
                                     backgroundImage: `url(${element.backgroundImage})`,
                                 }}>
                                <input className="flyer-element-focus-input"/>
                                {
                                    element.type === 'text' ?
                                        <div style={{position: "relative"}}>
                                            {/*<i className="bi bi-pencil" onClick={toggleEditTextPanel(i)}*/}
                                            {/*   id={`editTextPanelToggle${i}`}/>*/}

                                            <ContentEditable
                                                html={element.content || '<span></span>'} // innerHTML of the editable div
                                                onChange={onChangeElementText(element.id)} // handle innerHTML change
                                            />

                                        </div>
                                        :
                                        <div>
                                            <label htmlFor={`product-photo-${i}`}>
                                                <i className="bi bi-images flyer-element-change-image-action"/>
                                                <input type="file" id={`product-photo-${i}`}
                                                       className="invisible position-absolute"
                                                       onChange={onChangeElementImage(element.id)}
                                                       accept="image/png, image/gif, image/jpeg"/>
                                            </label>
                                            <img
                                                src={element.content}
                                                width={element.size.width}
                                                height={element.size.height}
                                                style={{
                                                    borderRadius: element.border?.radius,
                                                    borderColor: element.border?.color,
                                                    borderStyle: element.border?.style,
                                                    borderWidth: element.border?.width,
                                                }}
                                            />
                                        </div>
                                }
                            </Rnd>
                        )
                    )}
                </div>
                <div className="flyer-designer-actions">
                    <FormGroup>
                        <Label>Font size</Label>
                        <Input type="number" name="size.fontSize" value={selectedElement.size.fontSize || 0}
                               onChange={onChangeFlyerElementProps}/>
                    </FormGroup>
                    <FormGroup className="flyer-designer-actions-text-item">
                        <Label>Padding</Label>
                        <Input type="number" name="padding" value={selectedElement.padding || 0}
                               onChange={onChangeFlyerElementProps}/>
                    </FormGroup>
                    <FormGroup>
                        <Label for="exampleSelect">Fuente</Label>
                        <Input type="select" name="fontFamily"
                               onChange={onChangeFlyerElementProps}
                               value={selectedElement.fontFamily}>
                            <option>Seleccionar Fuente</option>
                            {fonts.map((font, i) =>
                                    <option key={i} value={font} style={{fontFamily: font}}>{font}</option>
                                )}
                        </Input>
                    </FormGroup>
                    <FormGroup>
                        <Label>
                            <i className="bi bi-paint-bucket"></i>
                            <Input onChange={onChangeFlyerElementProps} value={selectedElement.color?.background}
                                   type="color" name="color.background"
                                   id="exampleColor" placeholder="color placeholder"
                                   className="invisible position-absolute"/>
                        </Label>
                    </FormGroup>
                    <FormGroup>
                        <Label>
                            <i className="bi bi-fonts"></i>
                            <Input type="color" value={selectedElement.color?.text}
                                   onChange={onChangeFlyerElementProps} name="color.text"
                                   placeholder="color placeholder" className="invisible position-absolute"/>
                        </Label>
                    </FormGroup>
                    <FormGroup>
                        <i className="bi bi-square cursor-pointer" data-toggle="tooltip" data-placement="top" title="Tooltip on top" id="editTextItemBorderToggle"
                           onClick={toggleEditBorderItemPanel}/>
                        <Popover isOpen={editBorderItemPanelIsOpen}
                                 target="editTextItemBorderToggle" toggle={toggleEditBorderItemPanel}>
                            <PopoverHeader>Border Options</PopoverHeader>
                            <PopoverBody>
                                <FormGroup>
                                    <Input placeholder="Style" onChange={onChangeFlyerElementProps}
                                           type="select" name="border.style" id="exampleSelect"
                                           value={selectedElement.fontFamily}>
                                        <option value="">Selecciona Estilo</option>
                                        <option value="solid">Solid</option>
                                        <option value="dashed">Dashed</option>
                                        <option value="dotted">Dot</option>
                                    </Input>
                                </FormGroup>
                                <FormGroup>
                                    <Input type="number" name="border.width" placeholder="width"
                                           value={selectedElement.border?.width || 0}
                                           onChange={onChangeFlyerElementProps}/>
                                </FormGroup>
                                <FormGroup>
                                    <Input type="number" name="border.radius" placeholder="width"
                                           value={selectedElement.border?.radius || 0}
                                           onChange={onChangeFlyerElementProps}/>
                                </FormGroup>
                                <FormGroup>
                                    <Label>
                                        <i className="bi bi-palette"></i>
                                        <Input type="color" value={selectedElement.border?.color}
                                               onChange={onChangeFlyerElementProps} name="border.color"
                                               placeholder="color placeholder" className=""/>
                                    </Label>
                                </FormGroup>
                            </PopoverBody>
                        </Popover>
                    </FormGroup>
                    <FormGroup>
                        <i className="bi bi-border-width cursor-pointer" id="editTextItemStrokeToggle"
                           onClick={toggleEditStrokeItemPanel}/>
                        <Popover isOpen={editStrokeItemPanelIsOpen}
                                 target="editTextItemStrokeToggle" toggle={toggleEditStrokeItemPanel}>
                            <PopoverHeader>Bordes del Texto</PopoverHeader>
                            <PopoverBody>
                                <FormGroup>
                                    <Input type="number" name="stroke.width" placeholder="width"
                                           value={selectedElement.stroke?.width || 0}
                                           onChange={onChangeFlyerElementProps}/>
                                </FormGroup>
                                <FormGroup>
                                    <Label>
                                        <i className="bi bi-palette"></i>
                                        <Input type="color" value={selectedElement.stroke?.color}
                                               onChange={onChangeFlyerElementProps} name="stroke.color"
                                               placeholder="color placeholder" className=""/>
                                    </Label>
                                </FormGroup>
                            </PopoverBody>
                        </Popover>
                    </FormGroup>

                    <FormGroup>
                        <label>
                            <i className="bi bi-image-fill flyer-element-change-image-action"/>
                            <input type="file"
                                   onChange={onChangeElementImage(selectedElement.id, 'backgroundImage')}
                                   className="invisible position-absolute"
                                   accept="image/png, image/gif, image/jpeg"/>
                        </label>
                    </FormGroup>
                </div>
                <div className="flyer-designer-element-handler">
                    <Button onClick={addFlyerElement('text')}>Add Text</Button>
                    <Button onClick={addFlyerElement('image')}>Add Image</Button>
                </div>
            </div>
        </div>
    )
}

export default FlyerDesigner;
