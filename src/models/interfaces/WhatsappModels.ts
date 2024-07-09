import {Readable} from "stream";

export type WhatsappSessionTypes = 'wpadilla' | 'betuelgroup' | 'betueltravel' | 'bibleAssistant';
export const whatsappSessionList: WhatsappSessionTypes[] = ['betuelgroup', 'betueltravel', 'wpadilla', 'bibleAssistant']
export const whatsappSessionKeys: { [K in WhatsappSessionTypes]: WhatsappSessionTypes } = {
    wpadilla: 'wpadilla',
    betuelgroup: 'betuelgroup',
    betueltravel: 'betueltravel',
    bibleAssistant: 'bibleAssistant',
}

export interface IAudioFile {
    content: string | ArrayBuffer | Buffer | null,
    mimetype: string,
    fileName: string
}

// export interface IWhatsappMessage {
//     text?: string;
//     photo?: Blob;
//     audio?: IAudioFile;
// }


export type ICallbackMessage<T> = (recipient: IWsUser) => T;

export type IWhatsappMessage<Metadata = any, IMessageOptions = any> =
    ICleanSendWhatsappMessageData<Metadata, IMessageOptions>
export interface IExtraSendWhatsappMessageData<Metadata = any, IMessageOptions = any> {
    options?: any;
    metadata?: Metadata;
}

export interface ICleanSendWhatsappMessageData<T, R> extends IExtraSendWhatsappMessageData<T, R> {
    text?: string;
    media?: IMessageMedia;
    // poll?: IPollMessage;
    // list?: IListMessage;
    // buttons?: IListMessage;
}

export const whatsappSessionNames: { [K in WhatsappSessionTypes & any]: string } = {
    betueldance: 'Betuel Dance Shop',
    betuelgroup: 'Betuel Group',
    betueltravel: 'Betuel Travel',
    wpadilla: 'Williams',
    bibleAssistant: 'Asistente Biblico',
}


export interface IWsUser {
    firstName: string;
    lastName: string;
    phone: string;
}

export interface IWsGroup {
    subject: string;
    participants: IWsUser[];
    id?: string;
    description?: string;
    createAt?: any;
}

export interface IWsLabel {
    id: string;
    name: string;
    hexColor: string;
    users: IWsUser[];
}

export interface ISeed {
    groups: IWsGroup[];
    users: IWsUser[];
    labels: IWsLabel[];
}

export type WhatsappSeedTypes = 'users' | 'groups' | 'labels' | 'all';


export interface IMessageMedia {
    content: Buffer | string | Blob | ArrayBuffer | null;
    type: 'audio' | 'image' | 'video';
    caption?: string;
    name?: string;
    mimetype?: string;
}

export type WhatsappProductPromotionTypes = 'offer' | 'new' | 'best-seller' | 'full-stock';

export const wsPromotionTypeList: { type: WhatsappProductPromotionTypes, label: string }[] = [
    {type: 'offer', label: 'Ofertas'},
    {type: 'new', label: 'Nuevos'},
    {type: 'best-seller', label: 'Mas vendidos'},
    {type: 'full-stock', label: 'Stock completo'},
]

