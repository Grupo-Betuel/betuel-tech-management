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

export type CompanyTypes = 'betueltech' | 'betueldance' | 'betueltravel';

// export interface ICsd

export class ConstructorClass<T> {
    constructor(private data: Partial<T> = {} as any) {
        Object.keys({...data, ...this}).forEach(key => {
            (this as any)[key] = (data as any)[key] || (this as any)[key]
        });
    }
}
