import {OrderPaymentTypes} from "./ordersModels";
import {CommerceModel} from "./commerceModels";

export type ExpenseTypes = 'promotion' | 'merchant' | 'office' | 'fuel' | 'other';
export class ExpenseModel {
    _id?: string = '';
    type: ExpenseTypes = 'other';
    commerce: CommerceModel = {} as CommerceModel;
    taxReceipt: string = '';
    description: string = '';
    updateDate?: Date;
    paymentType: OrderPaymentTypes = 'card';
    createDate: Date = new Date();
    date: Date = new Date();
    amount: number = 0;
    itbis: number = 0;
    tips: number = 0;
    total: number = 0;
}