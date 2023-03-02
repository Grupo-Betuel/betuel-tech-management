import { CompanyTypes } from "./common";

export interface IProductData {
  _id: string;
  name: string;
  price: number;
  wholeSale: string;
  cost: number;
  commission: number;
  image: string;
  flyerOptions: string;
  GodWord: string;
  productImage: string;
  description: string;
  stock: number;
}

export type IProductBackground = {
  [N in CompanyTypes]: { [R in 1 | 2 | 3 | 4]?: any }
}
