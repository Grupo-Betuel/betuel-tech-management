import { ITag } from "./TagModel";

export type ClientStageTypes = 'potential' | 'real' | 'order-request';
export const clientStageList: ClientStageTypes[] = ['potential', 'real', 'order-request'];

export interface IClient {
    _id?: string;
    firstName: string,
    lastName: string,
    phone: string,
    stage: ClientStageTypes,
    tags: string[],
    fullName: string;
}
