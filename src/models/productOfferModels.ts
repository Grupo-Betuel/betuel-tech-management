import {BaseModel} from "./interfaces/BaseModel";

export interface IDueDateOffer {
    startDate: string;
    endDate: string;
}

export interface IVolumeOffer {
    buy: number;
    get: number;
}

// Enum for OfferType
export enum ProductOfferTypes {
    Stock = 'stock',
    DueDate = 'dueDate',
    Volume = 'volume',
}

// Interface for ProductOffers document
export interface IProductOffers extends BaseModel {
    type: ProductOfferTypes;
    dueDate?: IDueDateOffer;
    volume?: IVolumeOffer;
    stock?: number;
    price: number;
    flyerOptions: string;
    product: string; // Assuming the product ID is a string. Adjust the type if necessary.
    images: string[];
    enabled: boolean;
}

