import React from "react";
import "./FlyerDesignerTemplateSelector.scss";
import {FlyerTemplateModel} from "../../../../model/flyerTemplateModel";
import {Button, Input, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";

export interface IFlyerDesignerTemplateSelectorProps {
    onSelectTemplate: (template: FlyerTemplateModel) => void;
    templates: FlyerTemplateModel[];
}

export const FlyerDesignerTemplateSelector = (
    {
        onSelectTemplate,
        templates,
    }: IFlyerDesignerTemplateSelectorProps) => {

    const [selectedTemplate, setSelectedTemplate] = React.useState<FlyerTemplateModel>();
    const handleSelectTemplate = (template: FlyerTemplateModel) => () => {
        setSelectedTemplate(template);
    }

    const confirmSelectTemplate = () => {
        onSelectTemplate(selectedTemplate || {} as FlyerTemplateModel);
        setSelectedTemplate(undefined);
    }

    const removeSelectedTemplete   = () => {
        setSelectedTemplate(undefined);
    }

    return (
        <div className="flyer-designer-template-selector">
            <div className="flyer-designer-template-selector-grid">
                {templates.map((template, i) => (
                    <div onClick={handleSelectTemplate(template)} className="flyer-designer-template-selector-grid-item">
                        <img
                            src={template.preview}
                            key={`template-preview-${i}`}
                        />
                        <p>{template.name}</p>
                    </div>
                ))}
            </div>
            <div className="flyer-designer-template-selector-actions">

            </div>
            <Modal isOpen={!!selectedTemplate} toggle={removeSelectedTemplete}>
                <ModalHeader toggle={removeSelectedTemplete}>Confirmación</ModalHeader>
                <ModalBody>
                    (Esto cambiara el diseño completo) <br/> ¿Estas Seguro que deseas seleccionar la plantilla <b>{selectedTemplate?.name}</b>?
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={confirmSelectTemplate}>Confirmar</Button>{' '}
                    <Button color="secondary" onClick={removeSelectedTemplete}>Cancel</Button>
                </ModalFooter>
            </Modal>
        </div>
    )
}