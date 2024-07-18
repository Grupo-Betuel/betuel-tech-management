import { CompanyTypes } from "../common";
import {IProductData, IProductParam} from "../productModels";


export interface IProductSaleParam extends IProductParam {
    productParam?: string;
}
export interface ISale {
    _id: string;
    product: IProductData;
    productId: string;
    amount: number;
    unitPrice: number;
    unitProfit: number;
    unitCost: number;
    profit: number;
    commission?: number;
    shipping?: number;
    date: string;
    quantity?: number;
    company: string;
    params?: IProductSaleParam[];
    productParamId?: string;
};
