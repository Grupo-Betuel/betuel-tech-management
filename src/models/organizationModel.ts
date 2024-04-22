import {SocialNetworkModel} from "./socialNetworkModel";
import {IMedia} from "./mediaModel";
import {IContact} from "./contactModel";
import {IReview} from "./reviewsModel";

export interface IOrganization {
    type: 'church' | 'company' | 'transport' | 'restaurant' | 'hotel' | 'tourist-spot';
    name: string;
    description: string;
    logo: string;
    socialNetworks: SocialNetworkModel[];
    medias: IMedia[];
    contact: IContact;
    reviews: IReview[];
}
