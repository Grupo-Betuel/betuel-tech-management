export type WhatsappSessionTypes = 'wpadilla' | 'betuelgroup' | 'betueltravel';
export const whatsappSessionList: WhatsappSessionTypes[] = ['betuelgroup', 'betueltravel', 'wpadilla']
export const whatsappSessionKeys: {[K in WhatsappSessionTypes]: WhatsappSessionTypes} = {
    wpadilla: 'wpadilla',
    betuelgroup: 'betuelgroup',
    betueltravel: 'betueltravel',
}
export interface IWhatsappMessage {
    text?: string;
    photo?: Blob;
}

export const whatsappSessionNames: {[K in WhatsappSessionTypes]: string} = {
    betuelgroup: 'Betuel Group',
    betueltravel: 'Betuel Travel',
    wpadilla: 'Williams',
}


export interface IWsUser {
    firstName: string;
    lastName: string;
    phone: string;
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

export type WhatsappSeedTypes = 'users' | 'groups' | 'labels' | 'all';
