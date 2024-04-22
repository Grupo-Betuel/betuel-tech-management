// import jwt from 'jsonwebtoken';
import IUser from "../models/interfaces/user";

export const getAuthUser = (): IUser | boolean => {
    const authuser = localStorage.getItem('authUser');
    return authuser && JSON.parse(authuser);
};
