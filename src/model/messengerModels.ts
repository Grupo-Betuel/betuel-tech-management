import { ITrip } from './tripModels';

export type MessengerStatusTypes = 'available' | 'unavailable' | 'on-trip-to-office' | 'on-trip-to-client' | 'quoting';
export const messengerStatusList: MessengerStatusTypes[] = ['available' , 'unavailable' , 'on-trip-to-office' , 'on-trip-to-client' , 'quoting'];

export interface IMessenger {
  _id: string
  firstName: string
  lastName: string
  phone: string
  trips: ITrip[];
  status: MessengerStatusTypes;
  currentOrders?: string[];
  quotingOrder?: string | null;
  fromSocket?: boolean; // this is not from db
  //  consider these properties are not in the messenger table
  pendingMoney: number;
  pendingPayment: number;
}
