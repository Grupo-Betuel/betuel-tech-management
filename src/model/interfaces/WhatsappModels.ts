export type WhatsappSessionTypes = 'wpadilla' | 'betueltgroup' | 'betueltravel';
export const whatsappSessionList: WhatsappSessionTypes[] = ['betueltgroup', 'betueltravel', 'wpadilla']
export const whatsappSessionKeys: {[K in WhatsappSessionTypes]: WhatsappSessionTypes} = {
    wpadilla: 'wpadilla',
    betueltgroup: 'betueltgroup',
    betueltravel: 'betueltravel',
}
export interface IWhatsappMessage {
    text?: string;
    photo?: Blob;
}
export const whatsappSessionNames: {[K in WhatsappSessionTypes]: string} = {
    betueltgroup: 'Betuel Group',
    betueltravel: 'Betuel Travel',
    wpadilla: 'Williams',
}


export interface IWsUser {
    firstName: string;
    lastName: string;
    number: string;
}

export interface IWsGroup {
    subject: string;
    participants: IWsUser[];
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
