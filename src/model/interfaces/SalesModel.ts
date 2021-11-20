export interface ISale {
    _id: number;
    productId: number;
    price: number;
    profit: number;
    commission?: number;
    shipping?: number;
    productName: string;
    date: string;
    cost: number;
    quantity?: number;
};
