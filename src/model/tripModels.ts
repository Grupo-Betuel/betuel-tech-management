import {IClient, ILocation} from './ordersModels';
import { IMessenger } from './messengerModels';

export interface ITrip {
  location: ILocation;
  price: string | number;
  messenger: IMessenger;
  client: IClient;
}