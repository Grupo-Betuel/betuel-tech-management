import React from "react";
import {FormGroup, Input, PopoverBody, PopoverHeader, UncontrolledPopover} from "reactstrap";
import {InputProps} from "reactstrap/types/lib/Input";
import {FlyerElement, FlyerElementTypes} from "../../../model/interfaces/FlyerDesigner.interfaces";
import _ from "lodash";
import {ColorResult, SketchPicker} from "react-color";


export type FlyerActionsTypes = 'text' | 'number' | 'select' | 'color' | 'switch';

const FlyerActionElements: { [N in FlyerActionsTypes]: React.FC } = {
    text: (props: InputProps) => <Input {...props}/>,
    number: (props: InputProps) => <Input {...props} type="number"/>,
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
    select: (props: InputProps) => <Input {...props} type="select"/>,
}

export interface IActionContentOption {
    value: string | number,
    label: string,
}

export interface IFlyerActionContent {
    type: FlyerActionsTypes,
    property: string,
    options?: IActionContentOption[],
    props?: InputProps,
}

export interface IFlyerActionProps {
    tooltip?: string,
    content: IFlyerActionContent[],
    toggle?: JSX.Element,
    popoverHeader?: string | any,
    label?: string,
    selectedElement?: FlyerElement,
    onChangeElement: (id: number, value: Partial<FlyerElement>) => void,
    elementTypes: FlyerElementTypes[],
    onReset?: () => void,
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
    }: IFlyerActionProps) => {
    const [flyerActionId, setFlyerActionId] = React.useState(0)

    React.useEffect(() => {
        setFlyerActionId(counter += 1);
        return () => counter = 0;
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
        _.set<FlyerElement>(changedElement, name, value);
        onChangeElement(changedElement.id, changedElement);
    }

    const isEnabled = React.useMemo(() => {
        return selectedElement && elementTypes.indexOf(selectedElement.type) !== -1;
    }, [elementTypes, selectedElement]);

    const ActionElement = content.map(
        ({
             type,
             property,
             options,
             props: contentProps,
         }) => FlyerActionElements[type]({
            ...(contentProps || {}),
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

    const togglePopover = () => setPopoverIsOpen(!popoverIsOpen);

    const popoverId = `flyerActionPopover-${flyerActionId}`;

    const changesApplied = React.useMemo(() => selectedElement && _.get(selectedElement, content[0].property), [selectedElement]);
    return (
        (
            isEnabled &&
            <div data-toggle="tooltip" data-placement="top"
                       title={tooltip} className="position-relative">
                {toggle ?
                    <>
                        <span className="cursor-pointer" id={popoverId}
                              onClick={togglePopover}>
                            {toggle}
                        </span>
                        <UncontrolledPopover isOpen={popoverIsOpen}
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
                    <i className="bi bi-x cursor-pointer flyer-designer-reset-element-prop-icon"
                       onClick={onReset}
                    />
                }
            </div>
        )
    )

}