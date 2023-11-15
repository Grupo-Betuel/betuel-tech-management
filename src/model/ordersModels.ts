import { IMessenger, MessengerStatusTypes } from './messengerModels';
import { ITrip } from './tripModels';
import {ISale} from "./interfaces/SalesModel";

export interface ILocation {
    latitude: number
    longitude: number
    description: number
    link: string
}
export interface IClient {
  _id: string
  firstName: string
  lastName: string
  phone: string
  instagram: string
  tags: any[]
  __v: number
}

export interface ProductParam {
  isChildren: boolean
  relatedParams: ProductParam[]
  _id: string
  quantity: number
  value: string
  label: string
  type: string
  productId: string
  __v: number
}

export interface ProductId {
  _id: string
  name: string
  GodWord: string
  price: number
  cost: number
  commission: number
  image: string
  flyerOptions: string
  __v: number
  productImage: string
  description: string
  company: string
  lastFbPublicationDate: string
  facebookId: string
  lastIgPublicationDate: string
  instagramId: string
  productParams: ProductParam[]
  stock: number
}

export type OrderTypes = 'shipping' | 'pickup' | 'courier';
export const orderTypeList: OrderTypes[] = ['shipping', 'pickup', 'courier'];
export type OrderPaymentTypes = 'cash' | 'transfer' | 'card';
export const orderPaymentTypeList: OrderPaymentTypes[] = ['cash', 'transfer', 'card'];

export type OrderStatusTypes = 'pending' | 'personal-assistance' | 'confirmed' | 'checking-transfer' | 'pending-info' | 'delivering' | 'delivered' | 'canceled' | 'cancel-attempt' | 'completed';
export const orderStatusList: OrderStatusTypes[] = ['pending', 'pending-info', 'checking-transfer', 'confirmed', 'delivering', 'delivered', 'cancel-attempt', 'canceled', 'completed', 'personal-assistance'];
export interface IOrder {
  orderNumber: number;
  client: IClient
  status: OrderStatusTypes
  paymentType: OrderPaymentTypes
  // productId: ProductId
  sales: ISale[]
  company: string
  type: OrderTypes
  location?: ILocation
  // eslint-disable-next-line no-use-before-define
  transferReceipt?: ITransferReceipt
  messenger?: IMessenger;
  shippingPrice: number,
  total: number,
  hasConversation?: boolean,
  shippingTime: string,
  createDate: string,
  fromSocket: boolean, // this is not in the db
  _id: string
  __v: number
}

export interface ITransferReceipt {
  _id?: string
  image: string
  order?: string
  status: 'confirmed' | 'pending' | 'rejected'
  confirmedBy?: string
  updateDate?: Date
}

export interface IQuotedMessage {
  // type?: string;
  body: any;
  thumbnail?: '',
  inviteGrpType?: 'DEFAULT'
  type: 'image' | 'chat',
  deprecatedMms3Url: string,
  directPath: string,
  staticUrl: string,
  mimetype: 'image/jpeg' | 'image/png',
  caption: string,
  filehash: string,
  encFilehash: string,
  size: number,
  height: number,
  width: number,
  mediaKey: string,
  mediaKeyTimestamp: 1688058782,
  interactiveAnnotations: any[],
  scanLengths: any[],
  isViewOnce: false
}

export type IOrderData = {
  [N in string]: IOrder[];
}

export interface IHandleOrderChangeRequest {
  order: IOrder;
  type: 'update' | 'create';
}