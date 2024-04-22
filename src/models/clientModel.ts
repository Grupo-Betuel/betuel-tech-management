import {IService} from "./serviceModel";
import {SocialNetworkModel} from "./socialNetworkModel";

export interface IClient {
    firstName: string;
    lastName: string;
    phone: string;
    stage: string;
    email: string;
    deleted: boolean;
    services: IService[];
    socialNetworks: SocialNetworkModel[];
}
