export type FlyerElementTypes = 'text' | 'images';

export interface IFlyerElementSize {
    width: number;
    height: number;
    fontSize: number;
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
    size: number;
}

export interface IFlyerElement {
    type: FlyerElementTypes;
    size: Partial<IFlyerElementSize>;
    color: Partial<IFlyerElementColor>;
    position: Partial<IFlyerElementPosition>;
    fontFamily: string;
    shadow: boolean;
    border: IFlyerElementBorder;
    padding: number;
    backgroundImage: string;
}

export interface IFlyer {
    elements: IFlyerElement[];
    templateUrl: string;
    canvaSize: string;
}
