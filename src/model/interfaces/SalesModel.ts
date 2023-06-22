import { CompanyTypes } from "../common";
import {IProductParam} from "../products";

export interface ISale {
    _id: string;
    productId: string;
    price: number;
    profit: number;
    commission?: number;
    shipping?: number;
    productName: string;
    date: string;
    cost: number;
    quantity?: number;
    company: CompanyTypes;
    productParams?: IProductParam[];
    productParamId?: string;
};
