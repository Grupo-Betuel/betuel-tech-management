import {useMemo} from "react";
import React from "react";
import "./ShippingCard.scss";
import ContentEditable from "react-contenteditable";

export interface IShippingCardLayoutElement {
    id: string;
    width?: number | string;
    x: number | string;
    y: number | string;
    content: string | JSX.Element;
    fontSize?: number | string;
    style?: React.CSSProperties;
}

export interface IShippingCardLayout {
    name: IShippingCardLayoutElement;
    phone: IShippingCardLayoutElement;
    address: IShippingCardLayoutElement;
    details: IShippingCardLayoutElement;
    paymentStatus: IShippingCardLayoutElement;
    shippingCost: IShippingCardLayoutElement;
    total: IShippingCardLayoutElement;
    subtotal: IShippingCardLayoutElement;
    image: string;
    companyName?: IShippingCardLayoutElement;
    companyPhone?: IShippingCardLayoutElement;
    companyAddress?: IShippingCardLayoutElement;
    companyWebsite?: IShippingCardLayoutElement;
    companyInstagram?: IShippingCardLayoutElement;
    companyLogo?: IShippingCardLayoutElement;
}

export interface IShippingCardProps {
    layout: IShippingCardLayout;
    className?: string;
}


export const ShippingCard = ({layout, className }: IShippingCardProps) => {
    const elements = useMemo(() => {
        return Object.keys(layout).map((key) => {
            const item: any = layout[key as keyof IShippingCardLayout];
            if (typeof item === 'string') return;
            if ('y' in item && 'x' in item) {
                return {
                    key,
                    ...item,
                }
            }
        }).filter(Boolean) as IShippingCardLayoutElement[];

    }, [layout]);

    return (
        <div className={`shipping-card ${className || ''}`}>
            <img className="shipping-card-image" src={layout.image} alt="shipping-card-image"/>
            {elements.map((element) => (
                <div
                    id={element.id}
                    className="shipping-card-element"
                    style={{
                        position: 'absolute',
                        top: element.y,
                        left: element.x,
                        width: element.width,
                        // fontSize: `${(element?.fontSize || '16px')}`,
                        ...(element?.style || {}),
                    }}>
                    <ContentEditable
                        className="flyer-element-content-editable"
                        html={element.content?.toString() || ''} // innerHTML of the editable div
                        onChange={() => {}} // handle innerHTML change
                    />
                    {/*{element.content}*/}
                </div>
            ))}
        </div>
    )
}