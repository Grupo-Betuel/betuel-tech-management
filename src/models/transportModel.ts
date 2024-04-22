import {IOrganization} from "./organizationModel";
import {IBus} from "./busesModel";
import {IFinance} from "./financeModel";

export interface ITransport {
    finance: IFinance;
    organization: IOrganization;
    buses: IBus[];
}
