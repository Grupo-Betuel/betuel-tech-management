export interface IPayment {
    type: 'card' | 'transfer' | 'cash';
    date: Date;
    amount: number;
    comment?: string;
}
