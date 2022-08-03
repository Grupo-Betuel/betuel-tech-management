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
