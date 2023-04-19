export type FlyerElementTypes = 'text' | 'image';

export interface IFlyerElementSize {
    width: number | 'auto' | 'inherit';
    height: number | 'auto' | 'inherit';
    fontSize?: number;
}

export interface IFlyerElementColor {
    background: string;
    text: string;
}

export interface IFlyerElementPosition {
    x: number;
    y: number;
}

export interface IFlyerElementBorder {
    color: string;
    width: number;
    radius: number;
    type: 'dashed' | 'solid' | 'dotted';
}

export interface IFlyerElementTemporaryFile {
    type: 'background' | 'image';
    file: File;
}

export class FlyerElement {
    type: FlyerElementTypes = 'text';
    position: IFlyerElementPosition = {x: 0, y: 0};
    content: string = 'Betuel';
    size: IFlyerElementSize = {width: 'auto', height: 'auto', fontSize: 16};
    color?: Partial<IFlyerElementColor>;
    fontFamily?: string;
    shadow?: boolean;
    border?: Partial<IFlyerElementBorder>;
    padding?: number;
    backgroundImage?: string;
    temporaryFiles?: IFlyerElementTemporaryFile[];

    constructor(private data?: Partial<FlyerElement>) {
        if (data) {
            if (data.type === 'image') {
                data.content = 'https://scontent.fhex5-2.fna.fbcdn.net/v/t39.30808-6/328821026_749495603563998_1877185109065398972_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=09cbfe&_nc_ohc=S_kKTh8vt44AX-cwACG&_nc_ht=scontent.fhex5-2.fna&oh=00_AfCXkD5audRzZDmFgwFeob2yr1UfWZkSmmfZc1ukBTMA4w&oe=643F6F0F'
                data.size = { width: 100, height: 100 }
            }
            Object.keys(data).forEach(key => {
                (this as any)[key] = (data as any)[key];
            });
        }
    }
}

export interface IFlyerCanvaSize {
    width: number;
    height: number
}


export interface IFlyer {
    elements: FlyerElement[];
    templateUrl: string;
    canvaSize: IFlyerCanvaSize;
}
