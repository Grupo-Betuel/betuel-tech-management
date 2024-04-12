export type WhatsappSessionTypes = 'wpadilla' | 'betuelgroup' | 'betueltravel' | 'bibleAssistant';
export const whatsappSessionList: WhatsappSessionTypes[] = ['betuelgroup', 'betueltravel', 'wpadilla', 'bibleAssistant']
export const whatsappSessionKeys: {[K in WhatsappSessionTypes]: WhatsappSessionTypes} = {
    wpadilla: 'wpadilla',
    betuelgroup: 'betuelgroup',
    betueltravel: 'betueltravel',
    bibleAssistant: 'bibleAssistant',
}

export interface IAudioFile { content: string, fileName: string }
export interface IWhatsappMessage {
    text?: string;
    photo?: Blob;
    audio?: IAudioFile;
}

export const whatsappSessionNames: {[K in WhatsappSessionTypes & any]: string} = {
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
