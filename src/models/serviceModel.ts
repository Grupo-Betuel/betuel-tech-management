import {IFinance} from "./financeModel";
import {IPayment} from "./PaymentModel";
import {IExcursion} from "./excursionModel";

export interface IService {
    status: 'paid' | 'reserved' | 'interested';
    payments: IPayment[];
    type: 'excursion' | 'flight' | 'resort' | 'hotel';
    finance: IFinance;
    service?: IService;
    excursion?: IExcursion;
}
