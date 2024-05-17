import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types/AuthRequest'

export const auth = async (request: AuthRequest, response: Response, next: NextFunction) => {
    const authHeader = request.headers.authorization;

    if (!authHeader) 
        return response.status(401).json({ error: 'Unauthorized', message: 'Auth token is required!' });
    
    const [, token] = authHeader.split(' ');

    try {
        const decodedToken = await jwt.verify(token, 'suaChaveSecreta');
        // Armazena o payload decodificado no objeto request
        request.user = decodedToken;
        next();
    } catch (error) {
        console.error(error); // Adicionado para verificar se há erros de verificação do token
        return response.status(401).json({ error: 'Unauthorized', message: 'Invalid auth token!' });
    }
}
