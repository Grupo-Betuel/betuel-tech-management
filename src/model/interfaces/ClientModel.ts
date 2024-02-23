import { ITag } from "./TagModel";

export type ClientStageTypes = 'potential' | 'order-request' | 'retained' | 'loyal' | 'valued';

export const clientStageList: ClientStageTypes[] = ['potential', 'order-request', 'retained', 'loyal', 'valued'];

export interface IClient {
    _id?: string;
    firstName: string,
    lastName: string,
    phone: string,
    stage: ClientStageTypes,
    tags: string[],
    fullName: string;
    instagram: string
}
