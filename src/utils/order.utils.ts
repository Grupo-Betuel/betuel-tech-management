import {IOrder} from "../model/ordersModels";
import {IShippingCardLayout} from "../components/ShippingCard/ShippingCard";
import {ISale} from "../model/interfaces/SalesModel";

export const passOrderToShippingLayout = (order: IOrder, layoutData: IShippingCardLayout): IShippingCardLayout  => {
    const layout: IShippingCardLayout = structuredClone({...layoutData}) as IShippingCardLayout;
    (Object.keys(layout) as any[]).forEach((key: keyof IShippingCardLayout) => {
        const elementLayout = (layout as any)[key];
        if(key === 'details') {
            elementLayout.content = `${order.sales.map((sale: ISale) => sale.product.name).join(', ')}.`;
        } else if (key === 'name') {
            elementLayout.content = order.client.firstName || '' + ' ' + order.client.lastName || '';
        } else if(key === 'phone') {
            elementLayout.content = order.client.phone || '';
        } else if(key === 'address') {
            elementLayout.content = order?.location?.address || '';
        } else if(key === 'paymentStatus') {
            let status = 'NO';
            if(order.paymentType === 'cash') {
                status = 'NO';
            } else if(order.paymentType === 'transfer') {
                if(order.transferReceipt) {
                    status = order.transferReceipt.status === 'confirmed' ? 'SI' : 'NO';
                } else {
                    status = 'NO';
                }
            }
            elementLayout.content = status;
        } else if(key === 'subtotal') {
            elementLayout.content = `RD$${order.total?.toLocaleString() || ''}`;
        } else if(key === 'shippingCost') {
            elementLayout.content = `RD$${order.shippingPrice?.toLocaleString() || ''}`;
        } else if(key === 'total') {
            elementLayout.content = `RD$${(order.total + order.shippingPrice)?.toLocaleString() || ''}`;
        }

      (layout as any)[key] = elementLayout;
    });

    return layout;

}