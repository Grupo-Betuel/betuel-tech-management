import IUser from "./interfaces/user";

export interface IBus {
    model: string;
    driver: IUser; // Assuming there is a User model.
    capacity: number;
    color: string;
    description: string;
}
