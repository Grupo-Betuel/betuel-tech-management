import {Position, ResizableDelta, Rnd} from "react-rnd";
import React, { useEffect, useRef} from "react";
import {toPng} from "html-to-image";
import {dataURItoBlob} from "../../utils/blob";
import {gcloudPublicURL, getGCloudImages, uploadGCloudImage} from "../../services/gcloud";
import {
    IFlyer,
    FlyerElementModel,
    IFlyerElementPosition,
    FlyerElementTypes, ImageTypes
} from "../../model/interfaces/FlyerDesigner.interfaces";
import "./FlyerDesigner.scss";
import {ResizeDirection} from "re-resizable";
import {
    Button,
    Input,
    Modal, ModalBody, ModalFooter, ModalHeader,
    UncontrolledTooltip,
} from "reactstrap";
import _ from "lodash";
import {IMedia} from "../GCloudMediaHandler/GCloudMediaHandler";
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
import {removeExtraCharactersFromText, removeHTMLChars} from "../../utils/text.utils";
import {FlyerAction} from "./components/FlyerAction/FlyerAction";
import {FlyerActionsElements} from "./constants/flyer-actions-elements";
import {FlyerDesignerSidebar} from "./components/FlyerDesignerSidebar/FlyerDesignerSidebar";
import {FlyerElement} from "./components/FlyerElement/FlyerElement";
import {IProductData} from "../../model/products";

export interface IFlyerDesignerProps {
    onChangeFlyer?: (flyer: IFlyer) => void;
    validToSave?: (flyer: IFlyer) => boolean;
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
    templateImage: 'https://storage.googleapis.com/download/storage/v1/b/betuel-tech-photos/o/image-2682611001553.png?generation=1682611002092972&alt=media'
}

const saveIntervalTime = 1000 * 60;
export type IReferenceTypes = keyof IProductData;

export interface IReference {
    type: IReferenceTypes;
    label: string;
}

const referenceOptions: IReference[] = [
    {
        type: 'GodWord',
        label: 'Mensaje de Dios'
    },
    {
        type: 'productImage',
        label: 'Imagen del Producto'
    },
    {
        type: 'name',
        label: 'Nombre del Producto'
    },
    {
        type: 'price',
        label: 'Precio del producto'
    },
]

const flyerTemplateStoreKey = 'flyerTemplates';
const FlyerDesigner = (
    {
        onChangeFlyer,
        flyerOptions,
        templateId,
        onSaveFlyer,
        saveFlyerButtonProps,
        mediaName,
        validToSave,
    }: IFlyerDesignerProps) => {
    const [flyer, setFlyer] = React.useState<IFlyer>(blankFlyer);
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
    const [medias, setMedias] = React.useState<IMedia[]>([]);
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
        if (templateId && templates?.length) {
            const templateById = templates.find(t => t._id === templateId);
            templateById && onChangeTemplate(templateById);
        }
        if (flyerOptions?.elements) {
            updateFlyerWithOptions();
        }
    }, [templateId, templates]);

    React.useEffect(() => {
        updateFlyerWithOptions();
    }, [flyerOptions]);


    const updateFlyerWithOptions = () => {
        if (flyer.elements || flyerOptions?.elements) {
            const unitedF = {...flyer, ...flyerOptions};
            const newFlyer = passFlyerValueToFlyerContent(unitedF);
            setFlyer(newFlyer);
            setLastFlyer(newFlyer);
        }
    }

    const getMedias = async () => {
        const data = await getGCloudImages();
        setMedias(data);
    }

    React.useEffect(() => {
        getTemplates();
        getMedias();
    }, []);

    useEffect(() => {
        updateUndoFlyer();
        // if (saveInterval) clearInterval(saveInterval);
        // setSaveInterval(setInterval(handleAutomaticSave, saveIntervalTime));
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
            if (saveInterval) clearInterval(saveInterval);

            document.removeEventListener('keydown', handleKeyDown);
        }
    }, [undoFlyer, redoFlyer, flyer]);


    const changeFlyerElementProps = (id: number, value: Partial<FlyerElementModel>) => {
        const flyerValue = flyer.value || {};
        const newFlyerElements: FlyerElementModel[] = flyer.elements.map((element) => {
            if (element.id === id) {
                const newElement = {...element, ...value};
                setSelectedElement(newElement);
                if (element.ref) {
                    flyerValue[element.ref] = removeHTMLChars(newElement.content || '');
                }
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

    const processFlyerImage = async (downloadImage?: boolean): Promise<{ photoName: string, photoUrl: string }> => {
        const flyerName = removeExtraCharactersFromText(removeHTMLChars(flyer.value?.name || 'photo')).replace(/[ ]/gi, '-');
        const productURLName = `${flyerName}-flyer`;
        const photoName = `${productURLName}-${Date.now()}.png`;
        setImageToChangeType(undefined);
        setSelectedElement({} as FlyerElementModel);
        console.log(productImageWrapper.current);
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
        return {photoName, photoUrl: gcloudPublicURL + photoName};
    }
    const saveFlyer = (downloadImage?: boolean) => async () => {
        const flyerWithValue = passFlyerContentToFlyerValue(flyer);
        // check external validation beforeSaving
        if (validToSave && !validToSave(flyerWithValue)) return;

        if (productImageWrapper.current === null) {
            return
        }
        setLoading(true)
        const {photoUrl} = await processFlyerImage(downloadImage)
        setLoading(false)
        if (downloadImage) return;

        setLastFlyer(flyerWithValue);
        onSaveFlyer && onSaveFlyer(flyerWithValue, photoUrl);
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
                _.set<FlyerElementModel>(changedElement, imageToChangeType, img.content);
                changeFlyerElementProps(changedElement.id, changedElement);
            }

        }
    }

    const duplicateElement = () => {
        // eslint-disable-next-line no-undef
        const newElement: FlyerElementModel = structuredClone({
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

    const [selectedElement, setSelectedElement] = React.useState<FlyerElementModel>({} as FlyerElementModel);
    const [propertiesToReset, setPropertiesToReset] = React.useState<string[]>();
    const cleanPropertyToReset = () => {
        setPropertiesToReset(undefined);
    }
    const resetFlyerElementProp = () => {
        if (!propertiesToReset) return;
        const changedElement = selectedElement;
        propertiesToReset?.forEach(prop => {
            _.set<FlyerElementModel>(changedElement, prop, undefined);
        })
        changeFlyerElementProps(changedElement.id, changedElement);
        setPropertiesToReset(undefined);
    }

    const handleResetFlyerElementProp = (props: string[]) => () => {
        setPropertiesToReset(props);
    }

    const onChangeFlyerElementProps = ({target: {value, name, type, checked}}: React.ChangeEvent<HTMLInputElement>) => {
        if (type === 'number') {
            value = Number(value) as any;
        } else if (type === 'checkbox') {
            value = checked as any;
        }

        // eslint-disable-next-line no-undef
        const changedElement = selectedElement;
        _.set<FlyerElementModel>(changedElement, name, value);
        changeFlyerElementProps(changedElement.id, changedElement);
    }

    const selectElement = (element: FlyerElementModel) => () => {
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

    const createTemplateModel = async () => {
        const flyerWithValue = passFlyerContentToFlyerValue(flyer);
        const {photoUrl} = await processFlyerImage()

        const flyerTemplate: FlyerTemplateModel = {
            flyer: JSON.stringify(flyerWithValue),
            name: templateName,
            preview: photoUrl,
        };

        setLastFlyer(flyerWithValue);
        return flyerTemplate;
    }

    const getTemplates = async () => {
        setLoading(true);
        const storedTemplates = JSON.parse(localStorage.getItem(flyerTemplateStoreKey) || '[]');
        if (storedTemplates.length) {
            setTemplates(storedTemplates);
            setLoading(false);
        }
        const data = await getFlyerTemplates();
        setTemplates(data);
        localStorage.setItem(flyerTemplateStoreKey, JSON.stringify(data));
        setLoading(false);
    }

    const validTemplate = (): boolean => {
        if (!templateName) {
            toast('Template name is required', {type: 'error'});
            return false;
        }
        return true;
    }

    const createTemplate = async () => {
        if (!validTemplate()) return;
        setLoading(true);
        const flyerTemplate = await createTemplateModel();
        await addFlyerTemplate(JSON.stringify({
            ...flyerTemplate,
        }));
        toast('Template created successfully');
        await getTemplates();
        setLoading(false);
    }

    const updateTemplate = async () => {
        if (!validTemplate()) return;
        if (!selectedTemplate) return;
        setLoading(true);
        const flyerTemplate = await createTemplateModel();
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

    const onChangeTemplate = (template: FlyerTemplateModel) => {
        const {flyer: selectedFlyer} = template || {};
        // const selectedTemplate = templates.find(template => template._id === value);
        const flyerData = selectedFlyer ? JSON.parse(selectedFlyer) : blankFlyer;
        flyerData.value = flyerOptions?.value;
        const newFlyer = passFlyerValueToFlyerContent({...flyerData});
        setFlyer(newFlyer);
        setLastFlyer(newFlyer);
        setTimeout(() => setSelectedTemplate(template));
        setTemplateName(template?.name || '');
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
    const designSidebarRef = useRef<HTMLDivElement>(null)


    const handleAutomaticSave = async () => {
        if (JSON.stringify(flyer) === JSON.stringify(lastFlyer)) return;
        if (flyerOptions) {
            await saveFlyer(false)();
            toast('Flyer Saved automatically saved')
        } else {
            // await updateTemplate();
        }
    };


    useEffect(() => {

        document.addEventListener("click", handleClick);

        function handleClick(e: any) {
            e.stopPropagation();
            if (designWrapperRef && designWrapperRef.current) {
                const popovers = Array.from(document.querySelectorAll('.popover, .dropdown-menu')).map(item => item.contains(e.target)).reduce((a, b) => a || b, true);
                const ref: any = designWrapperRef.current;
                const unsetElement = e.target?.classList.contains('flyer-designer') || e.target?.classList.contains("flyer-designer-result-wrapper");
                if (!ref.contains(e.target) && !popovers || unsetElement) {
                    setSelectedElement({} as FlyerElementModel);
                    // put your action here
                }


                if (!e.target?.classList.contains('change-background-image-action')
                    && !e.target?.classList.contains('flyer-element-change-image-action')
                    && !e.target?.classList.contains('flyer-element-change-background-image')
                    && !designSidebarRef.current?.contains(e.target)) {
                    setImageToChangeType(undefined);
                }
            }
        }

        return () => {
            document.removeEventListener("click", handleClick);
            clearInterval(saveInterval);
        }

    }, [designSidebarRef]);

    const [deleteTemplateModal, setDeleteTemplateModal] = React.useState<boolean>();
    const toggleDeleteTemplateModal = () => setDeleteTemplateModal(!deleteTemplateModal);
    const moveElement = (type: 'up' | 'down') => {
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

    const addFlyerElement = (type: FlyerElementTypes, props?: Partial<FlyerElementModel>) => {
        const newElement = new FlyerElementModel({type, ...props})
        setFlyer({
            ...flyer,
            elements: [
                ...flyer.elements,
                newElement,
            ]
        })
    }

    // @ts-ignore
    return (
        <>
            <div className="flyer-designer" ref={designWrapperRef}>
                <Loading loading={loading}/>
                <FlyerDesignerSidebar
                    addFlyerElement={addFlyerElement}
                    onClickMedia={onChangeImage}
                    mediaName={mediaName}
                    imageToChangeType={imageToChangeType}
                    templates={templates}
                    onSelectTemplate={onChangeTemplate}
                    ref={designSidebarRef}
                    medias={medias}
                />
                <div className="flyer-designer-wrapper">
                    <div className="flyer-designer-top-bar">
                        <div className="flyer-designer-top-bar-actions-grid">
                            {FlyerActionsElements.map((
                                action,
                                i
                            ) => (
                                <FlyerAction
                                    className="flyer-designer-top-bar-actions-grid-item"
                                    key={`flyer-action-${i}`}
                                    {...action}
                                    selectedElement={selectedElement}
                                    onChangeElement={changeFlyerElementProps}
                                    onReset={handleResetFlyerElementProp([action.parentProperty])}
                                />
                            ))}
                            {selectedElement.id &&
                                <div className="flyer-designer-top-bar-item position-relative">
                                    <label>
                                        <i className={`bi bi-image-fill cursor-pointer flyer-element-change-background-image ${imageToChangeType === 'backgroundImage' ? 'active' : ''}`}
                                           onClick={changeImageToChangeType('backgroundImage')}
                                           id="background-changer"
                                        />
                                    </label>
                                    <UncontrolledTooltip placement="top"
                                                         target="background-changer">
                                        Cambiar Fondo del Elemento
                                    </UncontrolledTooltip>
                                    {selectedElement.backgroundImage &&
                                        <i className="bi bi-x cursor-pointer flyer-designer-reset-element-prop-icon"
                                           onClick={handleResetFlyerElementProp(['backgroundImage'])}
                                        />
                                    }
                                </div>}
                        </div>
                        <div className="flyer-designer-top-bar-fixed-actions-wrapper">
                            <Button onClick={saveFlyer(true)} color="primary">Descargar</Button>
                            {onSaveFlyer &&
                                <Button className="flyer-designer-top-bar-item" onClick={saveFlyer()}
                                        color="primary" {...saveFlyerButtonProps}>Guardar</Button>
                            }
                        </div>

                    </div>

                    <div className="flyer-designer-result-wrapper">
                        <div>
                            <i className="bi bi-file-earmark-image change-background-image-action"
                               id="canva-background-changer"
                               onClick={changeImageToChangeType('templateImage')}
                            />
                            <UncontrolledTooltip placement="top"
                                                 target="canva-background-changer">
                                Cambiar Fondo del Diseño
                            </UncontrolledTooltip>
                        </div>
                        <div className={`flyer ${imageToChangeType === 'templateImage' ? 'selected' : ''}`}
                             id="product-image-result" ref={productImageWrapper}>
                            <Rnd
                                className=""
                                disableDragging={true}
                                style={{position: 'relative', outline: '1px solid #000'}}
                                onResize={onResizeFlyerCanva}
                                size={{
                                    width: flyer.canvaSize?.width || '500px',
                                    height: flyer.canvaSize?.height || 'auto'
                                }}
                            ><img src={flyer.templateImage} alt=""
                                  onClick={selectElement({} as FlyerElementModel)}
                                  className="flyer-designer-background-image"/>
                            </Rnd>

                            {flyer.elements?.map((element, i) =>
                                (
                                    <>
                                        <FlyerElement
                                            key={`flyer-element-${i}-${element.id}`}
                                            element={element}
                                            selected={selectedElement.id === element.id}
                                            onSelect={selectElement(element)}
                                            onDragStop={onDragElementStop(element.id)}
                                            onResize={onResizeElement(element.id)}
                                            onMoveFlyerElement={moveElement}
                                            onKeyDownFlyerElement={onKeyDownFlyerElement}
                                            onChangeElementText={onChangeElementText(element.id)}
                                            onChangeImage={changeImageToChangeType('content')}
                                            imageToChangeType={imageToChangeType}
                                            onDuplicate={duplicateElement}
                                            onRemove={removeElement}
                                        />
                                    </>
                                )
                            )}
                        </div>
                    </div>
                    <div className="flyer-designer-element-handler">
                    </div>
                    <div className="flyer-designer-bottom-bar">
                        {selectedElement.id &&
                            <div className="border-end pe-3">
                                <Input type="select" name="ref" placeholder="Referencia"
                                       value={selectedElement.ref || ''}
                                       onChange={onChangeElementRef}>
                                    <option value="">Select Referencia</option>
                                    {referenceOptions.map((ref, i) =>
                                        <option
                                            selected={!!referenceOptions.find(r => r.type === ref.type)}
                                            value={ref.type}
                                            key={`reference-${i}`}
                                        >{ref.label}</option>)
                                    }
                                </Input>
                            </div>}

                        <Input onChange={onChangeTemplateName}
                               value={templateName}/>
                        <Button onClick={createTemplate} color="primary">Crear Plantilla</Button>
                        {
                            selectedTemplate?._id && <>
                                <Button onClick={updateTemplate} color="info">Actualizar Plantilla</Button>
                                <Button onClick={toggleDeleteTemplateModal} color="danger">Delete Plantilla</Button>
                            </>}
                    </div>
                </div>
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

            <Modal isOpen={!!propertiesToReset} toggle={cleanPropertyToReset}>
                <ModalHeader toggle={cleanPropertyToReset}>Confirmación</ModalHeader>
                <ModalBody>
                    ¿Estas Seguro que deseas eliminar estos estilos?
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={resetFlyerElementProp}>Confirmar</Button>{' '}
                    <Button color="secondary" onClick={cleanPropertyToReset}>Cancel</Button>
                </ModalFooter>
            </Modal>


        </>
    )
}

export default FlyerDesigner;
