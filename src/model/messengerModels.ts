import { ITrip } from './tripModels';

export type MessengerStatusTypes = 'available' | 'unavailable' | 'on-trip-to-office' | 'on-trip-to-client' | 'quoting';
export interface IMessenger {
  _id: string
  firstName: string
  lastName: string
  phone: string
  trips: ITrip[];
  status: MessengerStatusTypes;
  activeOrder?: string | null;
}
