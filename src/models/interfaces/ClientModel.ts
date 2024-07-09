import { ITag } from "./TagModel";
import {OrderFromTypes} from "../ordersModels";

export type ClientStageTypes = 'potential' | 'order-request' | 'retained' | 'loyal' | 'valued';

export const clientStageList: ClientStageTypes[] = ['potential', 'order-request', 'retained', 'loyal', 'valued'];

export interface IClient {
    _id?: string;
    firstName: string,
    lastName: string,
    from: OrderFromTypes,
    phone: string,
    stage: ClientStageTypes,
    tags: string[],
    fullName: string;
    instagram: string
}
