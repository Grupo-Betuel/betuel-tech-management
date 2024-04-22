export interface IFinance {
    price: number;
    cost: number;
    type: 'transport' | 'food' | 'excursion' | 'resort' | 'service' | 'flight';
}
