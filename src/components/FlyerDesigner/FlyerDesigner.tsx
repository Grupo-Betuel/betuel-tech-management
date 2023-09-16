import {Position, ResizableDelta, Rnd} from "react-rnd";
import React, {useCallback, useEffect, useRef} from "react";
import logo from "../../assets/images/betueltech.png";
import {toPng} from "html-to-image";
import {dataURItoBlob} from "../../utils/blob";
import {gcloudPublicURL, uploadGCloudImage} from "../../services/gcloud";
import {
    IFlyer,
    FlyerElement,
    IFlyerElementPosition,
    FlyerElementTypes, ImageTypes
} from "../../model/interfaces/FlyerDesigner.interfaces";
import "./FlyerDesigner.scss";
import {ResizeDirection} from "re-resizable";
import ContentEditable from "react-contenteditable";
import {
    Button, FormGroup,
    Input,
    Label, Modal, ModalBody, ModalFooter, ModalHeader,
    Popover,
    PopoverBody,
    PopoverHeader
} from "reactstrap";
import _ from "lodash";
import {GCloudMediaHandler, IMedia} from "../GCloudMediaHandler/GCloudMediaHandler";
import {
    addFlyerTemplate,
    deleteFlyerTemplate,
    getFlyerTemplates,
    updateFlyerTemplate
} from "../../services/flyerTemplateService";
import {toast} from "react-toastify";
import {FlyerTemplateModel} from "../../model/flyerTemplateModel";
import {Loading} from "../Loading/Loading";
import {passFlyerContentToFlyerValue, passFlyerValueToFlyerContent} from "../../utils/flyer.utils";
import {removeHTMLChars} from "../../utils/text.utils";

const fonts = ['Reey Regular',
    'Rockwell Extra Bold', 'Anisha',
    'Abadi MT Condensed',
    'Oswald', 'Beta', 'Montserrat Bold',
    'Tondu Beta', 'Cubano'
]

export interface IFlyerDesignerProps {
    onChangeFlyer?: (flyer: IFlyer) => void;
    onSaveFlyer?: (flyer: IFlyer, image: string) => void;
    templateId?: string;
    flyerOptions?: IFlyer;
    saveFlyerButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
    mediaName?: string;
}

const blankFlyer: IFlyer = {
    elements: [
        {
            id: 1,
            type: 'text',
            position: {x: 113, y: 230},
            content: 'Grupo Betuel',
            fontFamily: 'Rockwell Extra Bold',
            size: {fontSize: 35, width: 'auto', height: 'auto'},
        },
    ],
    templateImage: 'https://storage.googleapis.com/download/storage/v1/b/betuel-tech-photos/o/image-1682611001553.png?generation=1682611002092972&alt=media'
}

const saveIntervalTime = 1000 * 60;

const flyerTemplateStoreKey = 'flyerTemplates';
const FlyerDesigner = ({onChangeFlyer, flyerOptions, templateId, onSaveFlyer, saveFlyerButtonProps, mediaName }: IFlyerDesignerProps) => {
    const [flyer, setFlyer] = React.useState<IFlyer>({} as IFlyer);
    const [lastFlyer, setLastFlyer] = React.useState<IFlyer>({} as IFlyer);
    const [undoFlyer, setUndoFlyer] = React.useState<IFlyer[]>([]);
    const [redoFlyer, setRedoFlyer] = React.useState<IFlyer[]>([]);
    const [hideChangeProductPhotoIcon, setHideChangeProductPhotoIcon] = React.useState(false);
    const [editBorderItemPanelIsOpen, setEditBorderItemPanelIsOpen] = React.useState<boolean>();
    const [editStrokeItemPanelIsOpen, setEditStrokeItemPanelIsOpen] = React.useState<boolean>();
    const [editShadowItemPanelIsOpen, setEditShadowItemPanelIsOpen] = React.useState<boolean>();
    const [editTextShadowItemPanelIsOpen, setEditTextShadowItemPanelIsOpen] = React.useState<boolean>();
    const [editTransformItemPanelIsOpen, setTransformItemPanelIsOpen] = React.useState<boolean>();
    const [templateName, setTemplateName] = React.useState<string>('');
    const [selectedTemplate, setSelectedTemplate] = React.useState<FlyerTemplateModel>();
    const [templates, setTemplates] = React.useState<FlyerTemplateModel[]>([]);
    const [loading, setLoading] = React.useState<boolean>();
    const toggleImageGrid = () => setImageToChangeType(undefined);
    const [imageToChangeType, setImageToChangeType] = React.useState<ImageTypes>();
    const [saveInterval, setSaveInterval] = React.useState<any>();
    // const [c]
    const productImageWrapper = useRef<HTMLDivElement>(null)
    const portfolioMode = false;

    const updateUndoFlyer = _.debounce(() => {
        setUndoFlyer([...undoFlyer, flyer]);
    }, 100);

    React.useEffect(() => {
        onChangeTemplate({target: {value: templateId}} as any);
        if(flyerOptions?.elements) {
            updateFlyerWithOptions();
        }
    }, [templateId, templates]);

    React.useEffect(() => {
        updateFlyerWithOptions();
    }, [flyerOptions]);


    const updateFlyerWithOptions = () => {
        if(flyer.elements || flyerOptions?.elements) {
            const unitedF = { ...flyer, ...flyerOptions };
            const newFlyer = passFlyerValueToFlyerContent(unitedF);
            setFlyer(newFlyer);
            setLastFlyer(newFlyer);
        }
    }

    React.useEffect(() => {
        getTemplates();
    }, []);

    useEffect(() => {
        updateUndoFlyer();
        if(saveInterval) clearInterval(saveInterval);
        setSaveInterval(setInterval(handleAutomaticSave, saveIntervalTime));
    }, [flyer, lastFlyer]);


    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            const controlPressed = event.ctrlKey || event.metaKey;
            if (controlPressed && event.shiftKey && event.key.toLowerCase() === 'z') {
                if (redoFlyer.length > 0) {
                    const currentFlyer = redoFlyer[redoFlyer.length - 1];
                    setUndoFlyer(prevUndoFlyer => [...prevUndoFlyer, currentFlyer]);
                    setFlyer(currentFlyer);
                    setTimeout(() => setRedoFlyer(prevRedoFlyer => prevRedoFlyer.slice(0, -1)));
                }
            } else if (controlPressed && event.key.toLowerCase() === 'z') {
                if (undoFlyer.length > 1) {
                    const newUndoFlyer = undoFlyer.slice(0, -1);
                    const previousFlyer = newUndoFlyer[newUndoFlyer.length - 1];
                    setRedoFlyer(prevStack => [...prevStack, flyer]);
                    setFlyer(previousFlyer);
                    setTimeout(() => setUndoFlyer(() => [...newUndoFlyer]), 200);
                }
            }
        }

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            if(saveInterval) clearInterval(saveInterval);

            document.removeEventListener('keydown', handleKeyDown);
        }
    }, [undoFlyer, redoFlyer, flyer]);


    const changeFlyerElementProps = (id: number, value: Partial<FlyerElement>) => {
        const flyerValue = flyer.value;
        const newFlyerElements: FlyerElement[] = flyer.elements.map((element) => {
            if (element.id === id) {
                const newElement = {...element, ...value};
                setSelectedElement(newElement);
                return newElement;
            }
            return element;
        });

        setFlyer({
            ...flyer,
            elements: newFlyerElements,
            value: flyerValue,
        })
    }

    const saveFlyer = (downloadImage?: boolean) => async () => {
        setLoading(true)
        const flyerName = removeHTMLChars(flyer.value?.name || 'photo').replace(/[ ]/gi, '-');
        const productURLName = `${flyerName}-flyer`;
        const photoName = `${productURLName}-${Date.now()}.png`;
        setSelectedElement({} as FlyerElement);
        if (productImageWrapper.current === null) {
            return
        }
        // hidding options
        await toPng(productImageWrapper.current, {cacheBust: true,})
            .then(async (dataUrl: string) => {
                if (downloadImage) {
                    const a = document.createElement('a') as any;
                    a.href = portfolioMode ? 'product.image' : dataUrl;
                    a.download = photoName;
                    a.click();
                } else {
                    const blob = dataURItoBlob(dataUrl)
                    const file = new File([blob], photoName);
                    await uploadGCloudImage(file, 'flyer');
                }

                setHideChangeProductPhotoIcon(false);
            })
            .catch((err: any) => {
                console.log(err)
            })
        setLoading(false)
        if(downloadImage) return;

        const flyerWithValue = passFlyerContentToFlyerValue(flyer);
        setLastFlyer(flyerWithValue);
        onSaveFlyer && onSaveFlyer(flyerWithValue, gcloudPublicURL + photoName);
    };

    const onChangeImage = (img: IMedia) => {
        if (imageToChangeType) {
            if (imageToChangeType === 'templateImage') {
                setFlyer({
                    ...flyer,
                    templateImage: img.content
                });
            } else {
                const changedElement = selectedElement;
                _.set<FlyerElement>(changedElement, imageToChangeType, img.content);
                changeFlyerElementProps(changedElement.id, changedElement);
            }

        }
    }

    const duplicateElement = () => {
        // eslint-disable-next-line no-undef
        const newElement: FlyerElement = structuredClone({
            ...selectedElement,
            id: new Date().getTime(),
            position: {
                x: selectedElement.position.x + 30,
                y: selectedElement.position.y + 30,
            }
        });
        setFlyer({
            ...flyer,
            elements: [...flyer.elements, newElement]
        })
    }

    const onKeyDownFlyerElement = (e: any) => {
        const isEditing = !!e.target.getAttribute("contenteditable");
        const controlPressed = e.ctrlKey || e.metaKey;

        if (e.key === 'Backspace' && !isEditing && flyer.elements) {
            removeElement();
        } else if (controlPressed && e.key.toLowerCase() === 'd') {
            duplicateElement();
        }
    }


    const onDragElementStop = (id: number) => (e: any, position: IFlyerElementPosition) => {
        const element = flyer.elements.find(item => item.id === id) || {} as any;

        changeFlyerElementProps(id, {
            position: {
                ...element.position,
                x: position.x,
                y: position.y,
            }
        })
    };

    const onResizeElement = (id: number) => (e: any, dir: ResizeDirection, elementRef: HTMLElement, size: ResizableDelta, position: Position) => {
        const element = flyer.elements.find(item => item.id === id) || {} as any;
        changeFlyerElementProps(id, {
            position: {
                ...element.position,
                x: position.x,
                y: position.y,
            }, size: {
                ...element.size,
                width: elementRef.offsetWidth,
                height: elementRef.offsetHeight,
            }
        });
    };

    const onResizeFlyerCanva = (e: any, dir: ResizeDirection, elementRef: HTMLElement) => {
        setFlyer({
            ...flyer,
            canvaSize: {
                ...flyer.canvaSize,
                width: elementRef.offsetWidth,
                height: elementRef.offsetHeight,
            }
        })
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

    const toggleEditShadowItemPanel = () => {
        setEditShadowItemPanelIsOpen(!editShadowItemPanelIsOpen);
    }

    const toggleEditTextShadowItemPanel = () => {
        setEditTextShadowItemPanelIsOpen(!editTextShadowItemPanelIsOpen);
    }

    const toggleTransformItemPanel = () => {
        setTransformItemPanelIsOpen(!editTransformItemPanelIsOpen);
    }


    const [selectedElement, setSelectedElement] = React.useState<FlyerElement>({} as FlyerElement);

    const resetFlyerElementProp = (props: string[]) => () => {
        const changedElement = selectedElement;
        props.forEach(prop => {
            _.set<FlyerElement>(changedElement, prop, undefined);
        })
        changeFlyerElementProps(changedElement.id, changedElement);
    }

    const onChangeFlyerElementProps = ({target: {value, name, type, checked}}: React.ChangeEvent<HTMLInputElement>) => {
        if (type === 'number') {
            value = Number(value) as any;
        } else if (type === 'checkbox') {
            value = checked as any;
        }

        // eslint-disable-next-line no-undef
        const changedElement = selectedElement;
        _.set<FlyerElement>(changedElement, name, value);
        changeFlyerElementProps(changedElement.id, changedElement);
    }

    const selectElement = (element: FlyerElement) => () => {
        setSelectedElement(element)
    };

    const removeElement = () => {
        const id = selectedElement.id;
        const newElements = flyer.elements.filter(item => item.id !== id);
        setFlyer({
            ...flyer,
            elements: newElements,
        });
    }

    const createTemplateModel = () => {
        const flyerWithValue = passFlyerContentToFlyerValue(flyer);

        const flyerTemplate: FlyerTemplateModel = {
            flyer: JSON.stringify(flyerWithValue),
            name: templateName,
        };
        setLastFlyer(flyerWithValue);
        return flyerTemplate;
    }

    const getTemplates = async () => {
        setLoading(true);
        const storedTemplates = JSON.parse(localStorage.getItem(flyerTemplateStoreKey) || '[]');
        if(storedTemplates.length) {
            setTemplates(storedTemplates);
            setLoading(false);
        }
        const data = await getFlyerTemplates();
        setTemplates(data);
        localStorage.setItem(flyerTemplateStoreKey, JSON.stringify(data));
        setLoading(false);
    }

    const createTemplate = async () => {
        setLoading(true);
        const flyerTemplate = createTemplateModel();
        await addFlyerTemplate(JSON.stringify(flyerTemplate));
        toast('Template created successfully');
        await getTemplates();
        setLoading(false);
    }

    const updateTemplate = async () => {
        if (!selectedTemplate) return;
        setLoading(true);
        const flyerTemplate = createTemplateModel();
        flyerTemplate._id = selectedTemplate._id;
        await updateFlyerTemplate(JSON.stringify(flyerTemplate));
        toast('Template updated successfully');
        await getTemplates();
        setLoading(false);
    }

    const deleteTemplate = async () => {
        if (!selectedTemplate) return;
        setLoading(true);
        await deleteFlyerTemplate(JSON.stringify({_id: selectedTemplate._id}));
        toast('Template deleted successfully');
        await getTemplates();
        setLoading(false);
        toggleDeleteTemplateModal();
    }

    const onChangeTemplate = ({target: {value}}: React.ChangeEvent<HTMLInputElement>) => {
        const selectedTemplate = templates.find(template => template._id === value);
        const flyerData = selectedTemplate?.flyer ? JSON.parse(selectedTemplate?.flyer) : blankFlyer;
        flyerData.value = flyerOptions?.value;
        const newFlyer = passFlyerValueToFlyerContent(flyerData);
        setFlyer(newFlyer);
        setLastFlyer(newFlyer);
        setTimeout(() => setSelectedTemplate(selectedTemplate));
        setTemplateName(selectedTemplate?.name || '');
    };

    const onChangeTemplateName = ({target: {value}}: React.ChangeEvent<HTMLInputElement>) => {
        setTemplateName(value)
    }

    const changeImageToChangeType = (type: ImageTypes) => () => setImageToChangeType(type);

    const onChangeElementRef = (ev: React.ChangeEvent<HTMLInputElement>) => {
        let pattern = new RegExp(
            "[`~!@#$^&*()=：”“'。，、？|{}':;'%,\\[\\].<>/?~！@#$……&*（）&;—|{ }【】‘；]", 'gi'
        );
        ev.target.value = ev.target.value.replace(pattern, '');
        onChangeFlyerElementProps(ev);
    }

    useEffect(() => {
        onChangeFlyer && onChangeFlyer(flyer);
    }, [flyer]);

    const designWrapperRef = useRef<any>();

    const handleAutomaticSave =  async () => {
        if(JSON.stringify(flyer) === JSON.stringify(lastFlyer)) return;
        if(flyerOptions) {
            await saveFlyer(false)();
            toast('Flyer Saved automatically saved')
        } else {
            await updateTemplate();
        }

    };


    useEffect(() => {

        document.addEventListener("click", handleClick);

        function handleClick(e: any) {
            if (designWrapperRef && designWrapperRef.current) {
                const popovers = Array.from(document.querySelectorAll('.popover')).map(item => item.contains(e.target)).reduce((a, b) => a || b, false);
                const ref: any = designWrapperRef.current
                if (!ref.contains(e.target) && !popovers) {
                    setSelectedElement({} as FlyerElement);
                    // put your action here
                }
            }
        }

        return () => {
            document.removeEventListener("click", handleClick);
            clearInterval(saveInterval);
        }

    }, []);

    const [deleteTemplateModal, setDeleteTemplateModal] = React.useState<boolean>();
    const toggleDeleteTemplateModal = () => setDeleteTemplateModal(!deleteTemplateModal);
    const moveElement = (type: 'up' | 'down') => () => {
        const index = flyer.elements.findIndex(item => item.id === selectedElement.id);
        const newElements = [...flyer.elements];
        const element = newElements[index];
        newElements.splice(index, 1);
        if (type === 'up') {
            newElements.splice(index + 1, 0, element);
        } else {
            newElements.splice(index - 1, 0, element);
        }
        setFlyer({
            ...flyer,
            elements: newElements,
        });
    }


    // @ts-ignore
    return (
        <>
            <div className="flyer-designer">
                <Loading loading={loading}/>
                <div className="template-actions">
                    <Input onChange={onChangeTemplateName}
                           value={templateName}/>
                    <Button onClick={saveFlyer(true)} color="primary">Descargar Imagen</Button>
                    <Button onClick={createTemplate} color="primary">Crear Plantilla</Button>
                    {selectedTemplate && <>
                        <Button onClick={updateTemplate} color="info">Update Plantilla</Button>
                        <Button onClick={toggleDeleteTemplateModal} color="danger">Delete Plantilla</Button>
                    </>}
                </div>
                <div className="flyer-design-wrapper" ref={designWrapperRef}>
                    <div className="flyer" id="product-image-result" ref={productImageWrapper}>
                        <Rnd
                            className=""
                            disableDragging={true}
                            style={{position: 'relative', outline: '1px solid #000'}}
                            onResize={onResizeFlyerCanva}
                            size={{width: flyer.canvaSize?.width || 'auto', height: flyer.canvaSize?.height || 'auto'}}
                        ><img src={flyer.templateImage} alt=""
                              onClick={selectElement({} as FlyerElement)}
                              className="flyer-designer-background-image"/>
                        </Rnd>
                        {flyer.elements?.map((element, i) =>
                            (
                                <Rnd
                                    className={`flyer-element ${selectedElement.id === element.id ? 'selected' : ''}`}
                                    id={element.id}
                                    onClick={selectElement(element)}
                                    key={i}
                                    position={{x: element.position.x, y: element.position.y}}
                                    size={{width: element.size.width, height: element.size.height}}
                                    onDragStop={onDragElementStop(element.id)}
                                    onResize={onResizeElement(element.id)}
                                >

                                    <input className="flyer-element-focus-input"/>
                                    <i className="bi bi-layer-forward flyer-element-shape-arrow top"
                                       onClick={moveElement('up')}/>
                                    <div
                                        tabIndex={0} onKeyDown={onKeyDownFlyerElement}
                                        className={`flyer-element-content ${selectedElement.id === element.id ? 'selected' : ''} text-stroke-${!element.stroke?.inside && element.stroke?.width}`}
                                        style={{
                                            // @ts-ignore
                                            '--text-stroke-color': element.stroke?.color || 'transparent',
                                            '-webkit-text-stroke': element.stroke?.inside ? `${element.stroke?.width}px ${element.stroke?.color || 'transparent'}` : undefined,
                                            fontSize: element.size?.fontSize,
                                            fontFamily: element.fontFamily,
                                            color: element.color?.text,
                                            backgroundColor: element.color?.background,
                                            textAlign: element.text?.align,
                                            letterSpacing: element.text?.letterSpacing,
                                            padding: element.padding,
                                            opacity: element.opacity,
                                            borderRadius: element.border?.radius ? element.border?.radius : undefined,
                                            borderColor: element.border?.color ? element.border?.color : undefined,
                                            borderStyle: element.border?.style ? element.border?.style : undefined,
                                            borderWidth: element.border?.width ? element.border?.width : undefined,
                                            boxShadow: `${element.shadow?.vertical || 0}px ${element.shadow?.horizontal || 0}px ${element.shadow?.blur || 0}px ${element.shadow?.color}`,
                                            textShadow: element.textShadow ? element.textShadow.custom || `${element.textShadow?.vertical || 0}px ${element.textShadow?.horizontal || 0}px ${element.textShadow?.blur || 0}px ${element.textShadow?.color}` : undefined,
                                            backgroundImage: `url(${element.backgroundImage})`,
                                            transform: `rotate(${element.transform?.rotation || 0}deg) skew(${element.transform?.skew?.x || 0}deg, ${element.transform?.skew?.y || 0}deg)`,
                                        }}
                                    >


                                        {
                                            element.type === 'text' ?
                                                <ContentEditable
                                                    className="flyer-element-content-editable"
                                                    html={element.content || '<span></span>'} // innerHTML of the editable div
                                                    onChange={onChangeElementText(element.id)} // handle innerHTML change
                                                />
                                                :

                                                <>
                                                    <label>
                                                        <i className="bi bi-images flyer-element-change-image-action"
                                                           onClick={changeImageToChangeType('content')}
                                                        />
                                                    </label>
                                                    <img
                                                        src={element.content}
                                                        width={element.size.width}
                                                        height={element.size.height}
                                                    />
                                                </>

                                        }



                                    </div>
                                    <i className="bi bi-layer-backward flyer-element-shape-arrow bottom"
                                       onClick={moveElement('down')}/>
                                </Rnd>
                            )
                        )}
                    </div>
                    <FormGroup className="expanded-action">
                        <Input placeholder="Style" onChange={onChangeTemplate}
                               type="select" name="border.style" id="exampleSelect"
                               value={selectedTemplate?._id || templateId}>
                            <option value="">Blank Template</option>
                            {templates.map(template => <option value={template._id}>
                                {template.name}
                            </option>)}
                        </Input>
                    </FormGroup>
                    <div className={`flyer-designer-actions ${!selectedElement.id ? 'd-none' : ''}`}>

                        <FormGroup>
                            <Label>Referencia</Label>
                            <Input type="text" name="ref" value={selectedElement.ref || ''}
                                   onChange={onChangeElementRef}/>
                        </FormGroup>
                        <FormGroup>
                            <Label>Font size</Label>
                            <Input type="number" name="size.fontSize" value={selectedElement.size?.fontSize || 0}
                                   onChange={onChangeFlyerElementProps}/>
                        </FormGroup>
                        <FormGroup className="flyer-designer-actions-text-item">
                            <Label>Padding</Label>
                            <Input type="number" name="padding" value={selectedElement.padding || 0}
                                   onChange={onChangeFlyerElementProps}/>
                        </FormGroup>
                        <FormGroup>
                            <Label>Letter Spacing</Label>
                            <Input type="number" name="text.letterSpacing"
                                   value={selectedElement.text?.letterSpacing || 0}
                                   onChange={onChangeFlyerElementProps}/>
                        </FormGroup>
                        <FormGroup>
                            <Label>Opacity</Label>
                            <Input type="number" name="opacity" min={0} max={1} step={0.1}
                                   value={selectedElement.opacity}
                                   onChange={onChangeFlyerElementProps}/>
                        </FormGroup>
                        <FormGroup>
                            <Label for="exampleSelect">Align</Label>
                            <Input type="select" name="text.align"
                                   onChange={onChangeFlyerElementProps}
                                   value={selectedElement.text?.align}>
                                <option>Seleccionar</option>
                                <option value="left">left</option>
                                <option value="center">center</option>
                                <option value="right">right</option>
                            </Input>
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
                                       rgba
                                       opacity
                                       id="exampleColor" placeholder="color placeholder"
                                       className="invisible position-absolute"/>
                            </Label>
                            {selectedElement.color?.background &&
                                <i className="bi bi-x cursor-pointer flyer-designer-reset-element-prop-icon"
                                   onClick={resetFlyerElementProp(['color.background'])}
                                />
                            }

                        </FormGroup>
                        <FormGroup>
                            <Label>
                                <i className="bi bi-fonts"></i>
                                <Input type="color" value={selectedElement.color?.text}
                                       onChange={onChangeFlyerElementProps} name="color.text"
                                       placeholder="color placeholder" className="invisible position-absolute"/>
                                <Input type="text" value={selectedElement.color?.text} onChange={onChangeFlyerElementProps} name="color.text"
                                       placeholder="Custom Color"/>
                            </Label>
                            {selectedElement.color?.text &&
                                <i className="bi bi-x cursor-pointer flyer-designer-reset-element-prop-icon"
                                   onClick={resetFlyerElementProp(['color.text'])}
                                />
                            }
                        </FormGroup>
                        <FormGroup>
                            <i className="bi bi-square cursor-pointer" data-toggle="tooltip" data-placement="top"
                               title="Tooltip on top" id="editTextItemBorderToggle"
                               onClick={toggleEditBorderItemPanel}/>
                            <Popover isOpen={editBorderItemPanelIsOpen}
                                     target="editTextItemBorderToggle" toggle={toggleEditBorderItemPanel}>
                                <PopoverHeader>Border Options</PopoverHeader>
                                <PopoverBody>
                                    <FormGroup>
                                        <Input placeholder="Style" placement="top" onChange={onChangeFlyerElementProps}
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
                            {selectedElement.border &&
                                <i className="bi bi-x cursor-pointer flyer-designer-reset-element-prop-icon"
                                   onClick={resetFlyerElementProp(['border'])}
                                />
                            }
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
                                               min={0}
                                               max={50}
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
                                    <FormGroup className="d-flex flex-column align-items-center" switch>
                                        <Label>Por dentro?</Label>
                                        <Input
                                            type="switch"
                                            role="switch"
                                            name="stroke.inside"
                                            checked={selectedElement.stroke?.inside}
                                            onChange={onChangeFlyerElementProps}/>
                                    </FormGroup>

                                </PopoverBody>
                            </Popover>
                            {selectedElement.stroke &&
                                <i className="bi bi-x cursor-pointer flyer-designer-reset-element-prop-icon"
                                   onClick={resetFlyerElementProp(['stroke'])}
                                />
                            }
                        </FormGroup>
                        <FormGroup>
                            <i className="bi bi-back cursor-pointer" id="editTextItemShadowToggle"
                               onClick={toggleEditShadowItemPanel}/>
                            <Popover isOpen={editShadowItemPanelIsOpen}
                                     target="editTextItemShadowToggle" toggle={toggleEditShadowItemPanel}>
                                <PopoverHeader>Box Shadow</PopoverHeader>
                                <PopoverBody>
                                    <FormGroup>
                                        <Input type="number" name="shadow.horizontal" placeholder="Horizontal"
                                               min={0}
                                               value={selectedElement.shadow?.horizontal || 0}
                                               onChange={onChangeFlyerElementProps}/>
                                    </FormGroup>
                                    <FormGroup>
                                        <Input type="number" name="shadow.vertical" placeholder="vertical"
                                               min={0}
                                               value={selectedElement.shadow?.vertical || 0}
                                               onChange={onChangeFlyerElementProps}/>
                                    </FormGroup>
                                    <FormGroup>
                                        <Input type="number" name="shadow.blur" placeholder="Blur"
                                               min={0}
                                               value={selectedElement.shadow?.blur || 0}
                                               onChange={onChangeFlyerElementProps}/>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label>
                                            <i className="bi bi-palette"></i>
                                            <Input type="color" value={selectedElement.shadow?.color}
                                                   onChange={onChangeFlyerElementProps} name="shadow.color"
                                                   placeholder="Color" className=""/>
                                        </Label>
                                    </FormGroup>
                                </PopoverBody>
                            </Popover>
                            {selectedElement.shadow &&
                                <i className="bi bi-x cursor-pointer flyer-designer-reset-element-prop-icon"
                                   onClick={resetFlyerElementProp(['shadow'])}
                                />
                            }
                        </FormGroup>
                        <FormGroup>
                            <i className="bi bi-file-font cursor-pointer" id="editItemTextShadowToggle"
                               onClick={toggleEditTextShadowItemPanel}/>
                            <Popover isOpen={editTextShadowItemPanelIsOpen}
                                     target="editItemTextShadowToggle" toggle={toggleEditTextShadowItemPanel}>
                                <PopoverHeader>Text Shadow</PopoverHeader>
                                <PopoverBody>
                                    <FormGroup>
                                        <Input type="number" name="textShadow.horizontal" placeholder="Horizontal"
                                               min={0}
                                               value={selectedElement.textShadow?.horizontal || 0}
                                               onChange={onChangeFlyerElementProps}/>
                                    </FormGroup>
                                    <FormGroup>
                                        <Input type="number" name="textShadow.vertical" placeholder="vertical"
                                               min={0}
                                               value={selectedElement.textShadow?.vertical || 0}
                                               onChange={onChangeFlyerElementProps}/>
                                    </FormGroup>
                                    <FormGroup>
                                        <Input type="number" name="textShadow.blur" placeholder="Blur"
                                               min={0}
                                               value={selectedElement.textShadow?.blur || 0}
                                               onChange={onChangeFlyerElementProps}/>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label>
                                            <i className="bi bi-palette"></i>
                                            <Input type="color" value={selectedElement.textShadow?.color || "#000"}
                                                   onChange={onChangeFlyerElementProps} name="textShadow.color"
                                                   placeholder="Color" className="" />
                                        </Label>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label>
                                            <i className="bi bi-palette"></i>
                                            <Input type="text" value={selectedElement.textShadow?.custom}
                                                   onChange={onChangeFlyerElementProps} name="textShadow.custom"
                                                   placeholder="Custom Value" />
                                        </Label>
                                    </FormGroup>
                                </PopoverBody>
                            </Popover>
                            {selectedElement.textShadow &&
                                <i className="bi bi-x cursor-pointer flyer-designer-reset-element-prop-icon"
                                   onClick={resetFlyerElementProp(['textShadow'])}
                                />
                            }
                        </FormGroup>
                        <FormGroup>
                            <i className="bi bi-bezier2 cursor-pointer" id="editItemTransformToggle"
                               onClick={toggleTransformItemPanel}/>
                            <Popover isOpen={editTransformItemPanelIsOpen}
                                     target="editItemTransformToggle" toggle={toggleTransformItemPanel}>
                                <PopoverHeader>Transform</PopoverHeader>
                                <PopoverBody>
                                    <FormGroup className="flyer-designer-actions-text-item">
                                        <Label>Rotation</Label>
                                        <Input type="number" name="transform.rotation"
                                               value={selectedElement.transform?.rotation || 0}
                                               onChange={onChangeFlyerElementProps}/>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label>Deformar Horizontal</Label>

                                        <Input type="number" name="transform.skew.x" placeholder="vertical"
                                               value={selectedElement.transform?.skew?.x || 0}
                                               onChange={onChangeFlyerElementProps}/>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label>Deformar Vertical</Label>
                                        <Input type="number" name="transform.skew.y" placeholder="Blur"
                                               value={selectedElement.transform?.skew?.y || 0}
                                               onChange={onChangeFlyerElementProps}/>
                                    </FormGroup>
                                </PopoverBody>
                            </Popover>
                            {selectedElement.transform &&
                                <i className="bi bi-x cursor-pointer flyer-designer-reset-element-prop-icon"
                                   onClick={resetFlyerElementProp(['transform'])}
                                />
                            }
                        </FormGroup>

                        <FormGroup>
                            <label>
                                <i className="bi bi-image-fill flyer-element-change-image-action cursor-pointer"
                                   onClick={changeImageToChangeType('backgroundImage')}
                                />
                            </label>
                            {selectedElement.backgroundImage &&
                                <i className="bi bi-x cursor-pointer flyer-designer-reset-element-prop-icon"
                                   onClick={resetFlyerElementProp(['backgroundImage'])}
                                />
                            }
                        </FormGroup>
                        <FormGroup>
                            <label>
                                <i className="bi bi-file-earmark-image flyer-element-change-image-action cursor-pointer"
                                   onClick={changeImageToChangeType('templateImage')}
                                />
                            </label>
                        </FormGroup>
                    </div>
                    <GCloudMediaHandler open={!!imageToChangeType} toggle={toggleImageGrid}
                                        onClickMedia={onChangeImage} mediaName={mediaName}/>
                </div>
                <div className="flyer-designer-element-handler">
                    <Button onClick={addFlyerElement('text')}>Agregar Texto</Button>
                    <Button onClick={addFlyerElement('image')}>Agregar Imagen</Button>
                    <Button onClick={saveFlyer()} color="primary" {...saveFlyerButtonProps}>Guardar</Button>
                </div>

                <Modal isOpen={!!deleteTemplateModal} toggle={toggleDeleteTemplateModal}>
                    <ModalHeader toggle={toggleDeleteTemplateModal}>Confirmación</ModalHeader>
                    <ModalBody>
                        ¿Estas Seguro que deseas eliminar la plantilla <b>{selectedTemplate?.name}</b>?
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={deleteTemplate}>Confirmar</Button>{' '}
                        <Button color="secondary" onClick={toggleDeleteTemplateModal}>Cancel</Button>
                    </ModalFooter>
                </Modal>
            </div>

        </>
    )
}

export default FlyerDesigner;
