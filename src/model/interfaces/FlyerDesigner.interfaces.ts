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

export interface IFlyerElementTransform {
    rotation?: number;
    skew?: IFlyerElementPosition;
}

export interface IFlyerElementStrokeBorder {
    color: string;
    width: number;
    radius: number;
    style: 'dashed' | 'solid' | 'dotted';
}

export interface IFlyerElementShadow {
    horizontal: number;
    vertical: number;
    blur: number;
    color: string;
}

export interface IFlyerElementTemporaryFile {
    type: 'background' | 'image';
    file: File;
}

export class FlyerElement {
    id: number = new Date().getTime();
    type: FlyerElementTypes = 'text';
    position: IFlyerElementPosition = {x: 0, y: 0};
    content: string = 'Betuel';
    size: IFlyerElementSize = {width: 'auto', height: 'auto', fontSize: 16};
    color?: Partial<IFlyerElementColor>;
    fontFamily?: string;
    border?: Partial<IFlyerElementStrokeBorder> = { width: 0, radius: 0, style: 'solid'}
    stroke?: Partial<IFlyerElementStrokeBorder>;
    shadow?: Partial<IFlyerElementShadow>;
    textShadow?: Partial<IFlyerElementShadow>;
    transform?: Partial<IFlyerElementTransform> = { rotation: 0, skew: {x: 0, y: 0} }
    padding?: number;
    backgroundImage?: string;
    temporaryFiles?: IFlyerElementTemporaryFile[];

    constructor(private data?: Partial<FlyerElement>) {
        if (data) {
            if (data.type === 'image') {
                data.content = 'https://betuel-group-management.vercel.app/static/media/betueltravel.c2713c66.png'
                data.size = { width: 100, height: 100 }
            }
            Object.keys(data).forEach(key => {
                (this as any)[key] = (data as any)[key] || (this as any)[key]
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
