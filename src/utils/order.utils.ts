import {IOrder} from "../model/ordersModels";
import {IShippingCardLayout} from "../components/ShippingCard/ShippingCard";
import {ISale} from "../model/interfaces/SalesModel";

export const passOrderToShippingLayout = (order: IOrder, layoutData: IShippingCardLayout): IShippingCardLayout  => {
    const layout: IShippingCardLayout = structuredClone({...layoutData}) as IShippingCardLayout;
    (Object.keys(layout) as any[]).forEach((key: keyof IShippingCardLayout) => {
        const elementLayout = (layout as any)[key];
        // this only apply to layoutElements of recelayout
        if (typeof elementLayout === 'string' || !('y' in elementLayout && 'x' in elementLayout)) return;
        if(key === 'details') {
            const categoryQuantities: any = {};
            order.sales.forEach((sale: ISale) => {
               categoryQuantities[sale.product.category.title] = categoryQuantities[sale.product.category.title] + 1 || 1;
            });
            elementLayout.content = `${Object.keys(categoryQuantities).map((cat: string) => {
                return `${categoryQuantities[cat]} ${cat}`
            }).join(', ')}.`;

        } else if (key === 'name') {
            elementLayout.content = order.client.firstName || '' + ' ' + order.client.lastName || '';
        } else if(key === 'phone') {
            elementLayout.content = order.client.phone || '';
        } else if(key === 'address') {
            elementLayout.content = order?.location?.address || '';
        } else if(key === 'paymentStatus') {
            const not = 'NO ❌';
            const yes = 'SÍ ✅';
            let status = not;
            if(order.paymentType === 'cash') {
                status = not;
            } else if(order.paymentType === 'transfer') {
                if(order.transferReceipt) {
                    status = order.transferReceipt.status === 'confirmed' ? yes : not;
                } else {
                    status = not;
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

        // setting id only to layout elements
        // if ('y' in elementLayout && 'x' in elementLayout) {
        elementLayout.id = `${Date.now()}-${Math.random()}-${key}`;
        // }
      (layout as any)[key] = elementLayout;
    });

    return layout;

}