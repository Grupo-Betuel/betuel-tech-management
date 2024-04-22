import {IBus} from "./busesModel";
import {ILocation} from "./ordersModels";

export interface ICheckpoint {
    // eslint-disable-next-line no-undef
    location: ILocation;
    description: string;
    buses: IBus[];
}
