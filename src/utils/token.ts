import jwt from 'jsonwebtoken';
export const parseToken = (token: string) => {
    return jwt.decode(token, {json: true});

};