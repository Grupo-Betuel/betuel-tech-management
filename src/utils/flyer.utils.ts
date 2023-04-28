import {IFlyer} from "../model/interfaces/FlyerDesigner.interfaces";

export const passFlyerValueToFlyerContent = (flyer: IFlyer): IFlyer => {
    if(!flyer.value) return flyer;
    Object.keys(flyer.value).forEach(key => {
        flyer.elements = flyer.elements.map(element => {
            if(element.ref === key) {
                element.content = String(flyer.value[key] || element.content);
            }
            return element;
        });
    });

    return flyer;
}

export const passFlyerContentToFlyerValue = (flyer: IFlyer): IFlyer => {
    if(!flyer.elements.length) return flyer;
    const value: any = {};
    flyer.elements.forEach(element => {
        if(!element.ref) return;
        value[element.ref] = element.content;
    });

    flyer.value = value;

    return flyer;
}

