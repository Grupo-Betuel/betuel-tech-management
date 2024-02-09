import {ILocation} from "./ordersModels";

export class CommerceModel {
    _id?: string = ''
    name: string = '';
    rnc: string = '';
    location?: ILocation;
    logo: string = '';
    phone: string = '';
}