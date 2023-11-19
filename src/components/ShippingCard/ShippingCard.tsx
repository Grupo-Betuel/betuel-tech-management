import {useMemo} from "react";
import React from "react";
import "./ShippingCard.scss";

export interface IShippingCardLayoutElement {
    width?: number | string;
    x: number | string;
    y: number | string;
    content: string | JSX.Element;
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
    increaseFontSize?: number;
}


export const ShippingCard = ({ layout, className, increaseFontSize }: IShippingCardProps) => {
    const elements = useMemo(() => {
        return Object.keys(layout).map((key) => {
            const item: any = layout[key as keyof IShippingCardLayout];
            if(typeof item === 'string') return;
            if('y' in item && 'x' in item) {
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
                    className="shipping-card-element"
                    style={{
                    position: 'absolute',
                    top: element.y,
                    left: element.x,
                    width: element.width,
                    ...(element?.style || {}),
                }}>
                    {element.content}
                </div>
            ))}
        </div>
    )
}