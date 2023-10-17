import {Position, ResizableDelta, Rnd} from "react-rnd";
import ContentEditable from "react-contenteditable";
import React from "react";
import {
    FlyerElementModel,
    IFlyerElementPosition,
    ImageTypes
} from "../../../../model/interfaces/FlyerDesigner.interfaces";
import {ResizeDirection} from "re-resizable";
import "./FlyerElement.scss";
import Rotatable from 'react-rotatable';
import {Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from "reactstrap";


export interface IFlyerElementProps {
    element: FlyerElementModel;
    selected?: boolean;
    onSelect?: (element: FlyerElementModel) => void;
    onDuplicate?: (element: FlyerElementModel) => void;
    onRemove?: (element: FlyerElementModel) => void;
    onDragStop?: (e: any, position: IFlyerElementPosition) => void;
    onResize?: (e: any, dir: ResizeDirection, elementRef: HTMLElement, size: ResizableDelta, position: Position) => void;
    onRotate?: (e: any, dir: ResizeDirection, elementRef: HTMLElement, size: ResizableDelta, position: Position) => void;
    onMoveFlyerElement?: (direction: 'up' | 'down') => void;
    onKeyDownFlyerElement?: (e: any) => void;
    onChangeElementText?: (e: any) => void;
    onChangeImage?: (e?: any) => void;
    isStatic?: boolean;
    imageToChangeType?: ImageTypes;
}

export const FlyerElement = (
    {
        element,
        selected,
        onSelect,
        onDragStop,
        onResize,
        onMoveFlyerElement,
        onKeyDownFlyerElement,
        onChangeElementText,
        onChangeImage,
        isStatic,
        imageToChangeType,
        onDuplicate,
        onRemove,
    }: IFlyerElementProps) => {
    const [optionDropdownOpen, setOptionDropdownOpen] = React.useState(false);

    const handleSelectElement = () => {
        onSelect && onSelect(element);
    }

    const handleMoveFlyerElement = (direction: 'up' | 'down') => () => {
        onMoveFlyerElement && onMoveFlyerElement(direction);
    }

    const handleOnChangeElementText = (e: any) => {
        onChangeElementText && onChangeElementText(e);
    }

    const handleOnChangeElementRotation = (e: any, e2: any, curr: any) => {
        console.log('rotating', curr, e, e2);
    }
    const styledElement = (
        <div
            tabIndex={0} onKeyDown={onKeyDownFlyerElement}
            className={`flyer-element-content ${selected ? 'selected' : ''} text-stroke-${!element.stroke?.inside && element.stroke?.width}`}
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
                    isStatic ? element.content : <ContentEditable
                        className="flyer-element-content-editable"
                        html={element.content || ''} // innerHTML of the editable div
                        onChange={handleOnChangeElementText} // handle innerHTML change
                    />
                    :

                    <>
                        <label>
                            <i className={`bi bi-images flyer-element-change-image-action ${imageToChangeType === 'content' ? 'active' : ''}`}
                               onClick={onChangeImage}
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
    )

    const toggleOptionDropdown = () => setOptionDropdownOpen(prevState => !prevState);

    const handleDuplicate = () => {
        onDuplicate && onDuplicate(element);
    }

    const handleRemove = () => {
        onRemove && onRemove(element);
    }
    return (
        isStatic ? <div className="flyer-element" onClick={handleSelectElement}>
                {
                    styledElement
                }
            </div> :
            <Rnd
                className={`flyer-element ${selected ? 'selected' : ''}`}
                id={element.id}
                onClick={handleSelectElement}
                position={{x: element.position.x, y: element.position.y}}
                size={{width: element.size.width, height: element.size.height}}
                onDragStop={onDragStop}
                onResize={onResize}
                resizeHandleClasses={{
                    bottom: 'size-item bottom',
                    top: 'size-item top',
                    right: 'size-item right',
                    left: 'size-item left',
                    bottomRight: 'size-item corner bottomRight',
                    bottomLeft: 'size-item corner bottomLeft',
                    topRight: 'size-item corner topRight',
                    topLeft: 'size-item corner topLeft'
                }}
            >
                <input className="flyer-element-focus-input"/>
                <Dropdown toggle={toggleOptionDropdown} isOpen={optionDropdownOpen}>
                    <DropdownToggle
                        className="flyer-element-options-toggle"
                        data-toggle="dropdown"
                    >
                        <span className="bi bi-three-dots" />
                    </DropdownToggle>
                    <DropdownMenu container="body">
                        <DropdownItem onClick={handleDuplicate}
                                      className="d-flex align-items-center gap-3 ">
                            <i className="bi bi-back" />
                            <span>Duplicar</span>
                        </DropdownItem>

                        <DropdownItem onClick={handleMoveFlyerElement('up')}
                                      className="d-flex align-items-center gap-3 ">
                            <i className="bi bi-layer-forward" />
                            <span>Mover Arriba</span>
                        </DropdownItem>
                        <DropdownItem onClick={handleMoveFlyerElement('down')}
                                      className="d-flex align-items-center gap-3 ">
                            <i className="bi bi-layer-backward" />
                            <span>Mover Abajo</span>
                        </DropdownItem>
                        <DropdownItem onClick={handleRemove}
                                      className="d-flex align-items-center gap-3 text-danger">
                            <i className="bi bi-trash" />
                            <span>Eliminar</span>
                        </DropdownItem>

                    </DropdownMenu>
                </Dropdown>

                {styledElement}


            </Rnd>
    )
}