import {IFinance} from "./financeModel";
import {IClient} from "./clientModel";

export interface IProjection {
    finance: IFinance;
    clients: IClient[];
    date: Date;
    done: boolean;
}
