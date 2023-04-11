import {
    AmenityData,
    CategoryData,
    CurrencyData,
    IHotel,
    IHotelListItem,
    IRate,
    ZoneData
} from "../model/interfaces/rateModels";

export const getHotelsWithRates = async (): Promise<IHotel[]> => {
    try {
        const response = await fetch(`${process.env.REACT_APP_PROMOTION_API}tarifario`);
        return await response.json();
    } catch (e) {
        throw e;
    }

};


export const getRoomsCategories = async (): Promise<CategoryData[]> => {
    try {
        const response = await fetch(`${process.env.REACT_APP_PROMOTION_API}tarifario/categories`);
        return await response.json() as any;
    } catch (e) {
        throw e;
    }

};


export const getAmenities = async (): Promise<AmenityData[]> => {
    try {
        const response = await fetch(`${process.env.REACT_APP_PROMOTION_API}tarifario/amenities`);
        return await response.json() as any;
    } catch (e) {
        throw e;
    }

};


export const getZones = async (): Promise<ZoneData[]> => {
    try {
        const response = await fetch(`${process.env.REACT_APP_PROMOTION_API}tarifario/zones`);
        return await response.json() as any;
    } catch (e) {
        throw e;
    }

};


export const getCurrencies = async (): Promise<CurrencyData[]> => {
    try {
        const response = await fetch(`${process.env.REACT_APP_PROMOTION_API}tarifario/currencies`);
        return await response.json() as any;
    } catch (e) {
        throw e;
    }

};

export const getHotelList = async (): Promise<IHotelListItem[]> => {
    try {
        const response = await fetch(`${process.env.REACT_APP_PROMOTION_API}tarifario/hotels`);
        return await response.json() as any;
    } catch (e) {
        throw e;
    }

};
