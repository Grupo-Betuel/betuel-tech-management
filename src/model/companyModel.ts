import {SocialNetworkModel} from "./socialNetworkModel";

export class CompanyModel {
    _id: any = '';

    name: string = '';

    companyId: string = '';

    description: string = '';

    phone: string = '';

    logo: string = '';

    facebook: SocialNetworkModel = {} as SocialNetworkModel;

    instagram: SocialNetworkModel = {} as SocialNetworkModel;
}
