import { ecommerceNames, ECommerceTypes } from "../services/promotions";
import { IProductData } from "./products";

export const errorMessages = {
    SELECT_AT_LEAST_ONE_PRODUCT: '¡Hey! Tienes que seleccionar almenos un producto para promocionar.',
    ECOMMERCE_ERROR: (ecommerce: ECommerceTypes, error: string) => `Error al Promocionar en ${ecommerceNames[ecommerce]}: ${error}`,
}

export const ecommerceMessages = {
    START_PUBLISHING: (ecommerce: ECommerceTypes) => `¡Ya comenzaron a publicarse los productos en ${ecommerceNames[ecommerce]}! 😆`,
    COMPLETED_PUBLISHING: (ecommerce: ECommerceTypes) => `¡Excelente! 🤯 ¡Ya se publicaron todos los productos en ${ecommerceNames[ecommerce]}! 🤩`,
    PUBLISHED_ITEM: (ecommerce: ECommerceTypes, product: IProductData) => `¡Ya ${product.name} se publico en ${ecommerceNames[ecommerce]}! 🤩`,
}
