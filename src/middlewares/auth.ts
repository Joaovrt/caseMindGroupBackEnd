import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export const auth = async (request: Request, response: Response, next: NextFunction) => {

    const authHeader = request.headers.authorization;

    if (!authHeader) 
        return response.status(401).json({message: 'Auth token is required!'});
    
    const [, token] = authHeader.split(' ');

    try {
        await jwt.verify(token, 'suaChaveSecreta');
        next();
    } catch (error) {
        return response.status(401).json({ message: 'Invalid auth token!' });
    }
}