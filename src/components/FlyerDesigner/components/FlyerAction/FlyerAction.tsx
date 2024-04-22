import React from "react";
import {FormGroup, Input, PopoverBody, PopoverHeader, UncontrolledPopover} from "reactstrap";
import {InputProps} from "reactstrap/types/lib/Input";
import {FlyerElementModel, FlyerElementTypes} from "../../../../models/interfaces/FlyerDesigner.interfaces";
import _ from "lodash";
import {ColorResult, SketchPicker} from "react-color";
import {UncontrolledTooltip} from 'reactstrap';
import "./FlyerAction.scss"

export type FlyerActionsTypes = 'text' | 'number' | 'select' | 'color' | 'switch';

const FlyerActionElements: { [N in FlyerActionsTypes]: React.FC } = {
    text: (props: InputProps) => <div className="p-2">
        {props.label && <label htmlFor={props.id}>{props.label}</label>}
        <Input {...props}/>
    </div>,
    number: (props: InputProps) => {
        return <div className="p-2">
            {props.label && <label htmlFor={props.id}>{props.label}</label>}
            <Input {...props} type="number"/>
        </div>
    },
    switch: (props: InputProps) =>
        <FormGroup switch={true} className="m-0">
            <Input {...props} type="switch" checked={!!props.value}
                   role="switch"/>
        </FormGroup>,
    color: (props: InputProps) => {
        const onChange = ({rgb}: ColorResult) => {
            const rgbaColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a})`;
            props.onChange && props.onChange({target: {value: rgbaColor, name: props.name, type: props.type}} as any)
        }

        return <SketchPicker
            color={props.value?.toString()}
            onChange={onChange}
        />
    },
    select: (props: InputProps) => {
        return <div className="p-2">
            {props.label && <label htmlFor={props.id}>{props.label}</label>}
            <Input {...props} type="select"/>
        </div>
    },
}

export interface IActionContentOption {
    value: string | number,
    label: string,
}

export interface IFlyerActionContent {
    type: FlyerActionsTypes,
    property: string,
    options?: IActionContentOption[],
    label?: string,
    props?: InputProps,
}

export interface IFlyerActionProps {
    tooltip?: string,
    content: IFlyerActionContent[],
    toggle?: JSX.Element,
    popoverHeader?: string | any,
    label?: string,
    selectedElement?: FlyerElementModel,
    onChangeElement: (id: number, value: Partial<FlyerElementModel>) => void,
    elementTypes: FlyerElementTypes[],
    onReset?: () => void,
    className?: string,
}

let counter = 0;
export const FlyerAction = (
    {
        content,
        tooltip,
        toggle,
        popoverHeader,
        onChangeElement,
        selectedElement,
        elementTypes,
        onReset,
        className,
    }: IFlyerActionProps) => {
    const [flyerActionId, setFlyerActionId] = React.useState(0)

    React.useEffect(() => {
        setFlyerActionId(counter += 1);
        return () => {
            counter = 0
        };
    }, []);

    const onChange = ({target: {value, name, type, checked}}: React.ChangeEvent<HTMLInputElement>) => {
        if (!selectedElement) return;
        if (type === 'number') {
            value = Number(value) as any;
        } else if (type === 'checkbox') {
            value = checked as any;
        }

        // eslint-disable-next-line no-undef
        const changedElement = selectedElement;
        _.set<FlyerElementModel>(changedElement, name, value);
        onChangeElement(changedElement.id, changedElement);
    }

    const isEnabled = React.useMemo(() => {
        return !!(selectedElement && elementTypes.indexOf(selectedElement.type) !== -1);
    }, [elementTypes, selectedElement]);

    const ActionElement = content.map(
        ({
             type,
             property,
             options,
             label,
             props: contentProps,
         }) => FlyerActionElements[type]({
            ...(contentProps || {}),
            label,
            onChange,
            value: _.get(selectedElement, property),
            children: options?.map((
                    option,
                    index
                ) => <option
                    key={`option-${flyerActionId}-${index}`}
                    value={option.value}>
                    {option.label}
                </option>
            ),
            name: property,
        }));

    const [popoverIsOpen, setPopoverIsOpen] = React.useState(false);

    const togglePopover = (ev: any) => {
        ev.stopPropagation();
        setPopoverIsOpen(!popoverIsOpen);
    }

    const popoverId = `flyerActionPopover-${flyerActionId}`;
    const wrapperId = `flyerActionWrapper-${flyerActionId}`;

    const changesApplied: boolean = React.useMemo(() => !!(selectedElement && _.get(selectedElement, content[0].property)), [selectedElement]);

    React.useEffect(() => {
        setPopoverIsOpen(false);
        // tooltip(false);
        const popoverTrigger = document.getElementById(popoverId);
        const tooltipTrigger = document.getElementById(popoverId);
        setTimeout(() => {
            popoverTrigger?.click();
            setTimeout(() => {
                popoverTrigger?.click();
            }, 100);
            tooltipTrigger?.dispatchEvent(new Event('mouseover'));
        }, 100);
    }, []);

    return (
        (

            <div data-toggle="tooltip" data-placement="top"
                 style={{display: isEnabled ? '' : 'none'}}
                 title={tooltip} className={`position-relative ${className || ''}`}>
                <div className="action-wrapper" id={wrapperId}>
                    {toggle ?
                        <>
                        <span className="cursor-pointer" id={popoverId}
                              onClick={togglePopover}>
                            {toggle}
                        </span>
                            <UncontrolledPopover
                                style={{display: isEnabled ? '' : 'none'}}
                                className="flyer-action-popover"
                                isOpen={popoverIsOpen}
                                target={popoverId}
                                toggle={togglePopover}
                                placement="bottom"
                                trigger="legacy">
                                <PopoverHeader>{popoverHeader}</PopoverHeader>
                                <PopoverBody>
                                    {ActionElement}
                                </PopoverBody>
                            </UncontrolledPopover>
                        </> : ActionElement}
                    {changesApplied &&
                        <i className="bi bi-trash cursor-pointer flyer-designer-reset-element-prop-icon"
                           onClick={onReset}
                        />
                    }
                </div>
                {(tooltip || popoverHeader) &&
                    <UncontrolledTooltip
                        style={{display: isEnabled ? '' : 'none'}}
                        placement="bottom"
                        target={wrapperId}>
                        {tooltip || popoverHeader}
                    </UncontrolledTooltip>}
            </div>
        )
    )

}