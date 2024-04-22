import {IOrganization} from "./organizationModel";
import {IFinance} from "./financeModel";

export interface IFood {
    organization: IOrganization;
    finance: IFinance;
    menu: string;
    type: 'desert' | 'lunch' | 'snack';
}
