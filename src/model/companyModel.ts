import {SocialNetworkModel} from "./socialNetworkModel";

export type CompanyTypes = 'store' | 'agency' | 'other';
export class CompanyModel {
    _id: any = '';

    name: string = '';

    type: CompanyTypes = 'store';

    companyId: string = '';

    description: string = '';

    phone: string = '';

    title: string = '';

    wallpapper: string = '';

    video: string = '';

    logo: string = '';

    facebook: SocialNetworkModel = {} as SocialNetworkModel;

    instagram: SocialNetworkModel = {} as SocialNetworkModel;
}
