export interface IRate {
    id: number;
    hotel: number;
    category: number;
    currency: number;
    start_date: string;
    ending_date: string;
    max_request_date: string;
    min_required_nights: number;
    children: number;
    teenagers: any;
    simple: number;
    double: number;
    triple: number;
    quadruple: any;
    children_age_range: string;
    first_child_free: boolean;
    first_child_free_age_range: string;
    second_child_free: boolean;
    second_child_free_age_range: string;
    max_occupants: number;
    bonus: number;
    available_rooms: number;
    notes: string;
    soft_deleted: boolean;
    created_at: string;
    updated_at: string;
    category_data: CategoryData;
    currency_data: CurrencyData;
    week_days: WeekDay[];
    total_amount?: number | string;
}

export interface CategoryData {
    id: number;
    name: string;
    max_children: number;
    created_at: string;
    updated_at: string;
}

export interface CurrencyData {
    id: number;
    name: string;
    acronym: string;
    value: number;
    created_at: string;
    updated_at: string;
}

export interface WeekDay {
    id: number;
    week_day: number;
    hotel_rate: number;
    created_at: string;
    updated_at: string;
    week_day_data: WeekDayData;
}

export interface WeekDayData {
    id: number;
    full_name: string;
    mid_name: string;
}

export interface ZoneData {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface Amenity {
    id: number;
    amenity: number;
    hotel: number;
    created_at: string;
    amenity_data: AmenityData;
}

export interface AmenityData {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface IHotel {
    id: number;
    name: string;
    description: string;
    phone: string;
    email: string;
    web: any;
    address: string;
    zone: number;
    stars: number;
    require_names: boolean;
    tax: boolean;
    commission: number;
    automatic_cancellation: number;
    status: boolean;
    created_at: string;
    updated_at: string;
    rates: IRate[];
    zone_data: ZoneData;
    amenities: Amenity[];
}

export interface IHotelListItem {
    id: number;
    name: string
    status: boolean;
    zone: number;
}

export interface IQuoteDetails {
    adults: number;
    children: number;
    nights: number;
    adultPrice: number;
    adultPriceText: string;
    childrenPriceText: string;
    childrenPrice: number,
    total: number,
    totalText: string,
    totalPesosText: string,
    hotel: string,
    singlePrice: number,
    doublePrice: number,
    triplePrice: number,
    singleText: string,
    doubleText: string,
    tripleText: string,
    kids: string,
    textToCopy: string,
    rateId: number,
    doubleQuantity: number,
    singleQuantity: number,
    tripleQuantity: number,
    dollarToPeso: number,
}

