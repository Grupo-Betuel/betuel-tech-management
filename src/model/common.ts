import { ECommerceTypes } from "../services/promotions";
import { IProductData } from "./products";

export type ECommerceResponseStatusTypes = 'publishing' | 'published' | 'completed' | 'failed';

export class ECommerceResponse {
    loading?: boolean = false;

    status: ECommerceResponseStatusTypes;

    ecommerce: ECommerceTypes;

    publication?: IProductData;

    error?: string;

    constructor(object: ECommerceResponse) {
        this.loading = object.loading;
        this.status = object.status;
        this.ecommerce = object.ecommerce;
        this.publication = object.publication;
        this.error = object.error;
    }
}

export type CompanyTypes = 'betueltech' | 'betueldance';

// export interface ICsd
