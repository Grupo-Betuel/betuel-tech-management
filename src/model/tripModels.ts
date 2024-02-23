import {ILocation} from './ordersModels';
import { IMessenger } from './messengerModels';
import {IClient} from "./interfaces/ClientModel";

export interface ITrip {
  location: ILocation;
  price: string | number;
  messenger: IMessenger;
  client: IClient;
}