import { ITag } from "./TagModel";

export interface IClient {
    _id?: string;
    firstName: string,
    lastName: string,
    number: string,
    tags: string[],
    fullName: string;
}
