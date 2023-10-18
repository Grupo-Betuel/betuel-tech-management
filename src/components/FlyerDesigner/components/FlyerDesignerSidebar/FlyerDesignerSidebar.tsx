import React, {useState} from 'react';
import "./FlyerDesignerSidebar.scss"
import {
    FlyerElementModel,
    FlyerElementTypes,
    ImageTypes
} from "../../../../model/interfaces/FlyerDesigner.interfaces";
import {FlyerDesignerTextStyles} from "../FlyerDesignerTextStyles./FlyerDesignerTextStyles";
import {IMedia} from "../../../GCloudMediaHandler/GCloudMediaHandler";
import {FlyerDesignerImageSelector} from "../FlyerDesignerImageSelector/FlyerDesignerImageSelector";
import {FlyerTemplateModel} from "../../../../model/flyerTemplateModel";
import {FlyerDesignerTemplateSelector} from "../FlyerDesignerTemplateSelector/FlyerDesignerTemplateSelector";

export interface IFlyerDesignerSidebarProps {
    addFlyerElement: (type: FlyerElementTypes, props?: Partial<FlyerElementModel>) => void;
    onClickMedia: (media: IMedia) => void;
    mediaName?: string;
    imageToChangeType?: ImageTypes;
    templates: FlyerTemplateModel[];
    onSelectTemplate: (template: FlyerTemplateModel) => void;
}

export type KeyOfSidebarOptions = 'text' | 'image' | 'template';

export type SidebarContentType = {
    [N in KeyOfSidebarOptions]: JSX.Element | any;
}

export interface IFlyerSidebarDesignerOption {
    id: KeyOfSidebarOptions;
    text: string;
    icon: string;
}


export const FlyerDesignerSidebar = React.forwardRef((
    {
        addFlyerElement,
        onClickMedia,
        mediaName,
        imageToChangeType,
        templates,
        onSelectTemplate,
    }: IFlyerDesignerSidebarProps, ref) => {

    const [selectedOption, setSelectedOption] = useState<IFlyerSidebarDesignerOption>({} as IFlyerSidebarDesignerOption);
    const [isOpen, setIsOpen] = useState(true);

    React.useEffect(() => {
        setSelectedOption(sidebarOptions[0]);
    }, []);

    const toggleIsOpen = () => setIsOpen(!isOpen);
    const handleOptionClick = (optionId: IFlyerSidebarDesignerOption) => () => {
        setIsOpen(true);
        setSelectedOption(optionId);
    };

    const handleMediaClick = (media: IMedia) => {
        if (imageToChangeType) {
            onClickMedia(media);
        } else {
            handleAddElement('image', {content: media.content});
        }
    }


    const handleAddElement = (type: FlyerElementTypes, props?: Partial<FlyerElementModel>) => {
        addFlyerElement(type, props);
    }

    const sidebarOptions: IFlyerSidebarDesignerOption[] = [
        {
            id: 'template',
            text: 'Plantillas',
            icon: 'bi bi-grid-1x2',
        },
        {
            id: 'text',
            text: 'Texto',
            icon: 'bi bi-fonts',
        },
        {
            id: 'image',
            text: 'Imagenes',
            icon: 'bi bi-images',
        },
    ]

    const sidebarContent: SidebarContentType = {
        'text': <FlyerDesignerTextStyles addFlyerElement={handleAddElement}/>,
        'image': <FlyerDesignerImageSelector onClickMedia={handleMediaClick} mediaName={mediaName} imageToChangeType={imageToChangeType}/>,
        'template': <FlyerDesignerTemplateSelector onSelectTemplate={onSelectTemplate} templates={templates}/>,
    }

    React.useEffect(() => {
        if (imageToChangeType) {
            setIsOpen(true);
            setSelectedOption(sidebarOptions.find(option => option.id === 'image') as IFlyerSidebarDesignerOption);
        } else {
            // setIsOpen(false);
        }
    },[imageToChangeType] );


    return (
        <div className="flyer-designer-sidebar" ref={ref as any}>
            <div className="flyer-designer-sidebar-menu">
                {sidebarOptions.map((option) => (
                    <div
                        key={option.id}
                        className={`flyer-designer-sidebar-menu-option ${selectedOption?.id === option.id ? 'selected' : ''}`}
                        onClick={handleOptionClick(option)}
                    >
                        <i className={option.icon}/>
                        <div className="text">{option.text}</div>
                    </div>
                ))}
            </div>
            {selectedOption !== null &&
                <div className={`flyer-designer-sidebar-content ${isOpen ? 'open' : ''}`}>
                    <div className="flyer-designer-sidebar-content-body">
                        {sidebarContent[selectedOption.id]}
                    </div>
                    <div className="flyer-designer-sidebar-content-toggle" onClick={toggleIsOpen}>
                        <i className={`bi bi-chevron-bar-${isOpen ? 'left' : 'right'}`}></i>
                    </div>
                </div>
            }
        </div>
    );
});