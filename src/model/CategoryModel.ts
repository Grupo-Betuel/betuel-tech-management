import {CompanyTypes} from "./common";

export interface ICategory {
    _id: string;
    title: string;
    company: CompanyTypes;
}