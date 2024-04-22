import React from "react";
import {FlyerElementModel, FlyerElementTypes} from "../../../../models/interfaces/FlyerDesigner.interfaces";
import {FlyerElement} from "../FlyerElement/FlyerElement";
import "./FlyerDesignerTextStyles.scss";

export interface IFlyerDesignerTextStylesProps {
    addFlyerElement: (type: FlyerElementTypes, props?: FlyerElementModel) => void;
}

export const FlyerDesignerTextStyles = ({addFlyerElement}: IFlyerDesignerTextStylesProps) => {
    const simpleText =  new FlyerElementModel({type: 'text', content: 'Agrega un texto'});

    const textElements: Partial<FlyerElementModel>[] = [
        {
            ... simpleText,
            type: 'text',
            content: 'Agrega un Titulo',
            size: {
                fontSize: 28,
            } as any,
        },
        {
            ... simpleText,
            type: 'text',
            content: 'Agrega un Subtitulo',
            size: {
                fontSize: 20,
            } as any,
        },
        {
            ... simpleText,
            type: 'text',
            content: 'Agrega un parrafo',
            size: {
                fontSize: 14,
            } as any,
        }
    ]

    const handleAddText = (props: FlyerElementModel) => {
        // const newElement = new FlyerElementModel({type: 'text', ...props})

        addFlyerElement('text', props)
    }

    return (
        <div className="flyer-designer-text-styles">
            <div className="flyer-designer-text-styles-item">
                <FlyerElement element={simpleText as FlyerElementModel} onSelect={handleAddText}
                              isStatic/>
            </div>
            {textElements
                .map((textElement, i) => (
                    <div className="flyer-designer-text-styles-item" key={`text-style-item${i}`}>
                        <FlyerElement element={textElement as FlyerElementModel} onSelect={handleAddText}
                                      isStatic/>
                    </div>
                ))}
        </div>
    )
}