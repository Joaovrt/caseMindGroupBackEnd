import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types/AuthRequest';

const prisma = new PrismaClient();

const UserController = {

    async login(request: Request, response: Response) {
        const { email, password } = request.body;

        try {
            const user = await prisma.user.findUnique({
                where: { email: email }
            });
            if (!user) {
                return response.status(404).json({ error: 'Usuário ou senha incorretos.' });
            }
            else if (await bcrypt.compare(password, user.password) && user.active) {
                const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, 'suaChaveSecreta', { expiresIn: '2d' });
                return response.status(200).json({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    token: token
                });
            } else {
                return response.status(401).json({ error: 'Usuário ou senha incorretos.' });
            }
            
        } catch (error) {
            console.error('Erro ao buscar usuário:', error);
            response.status(500).json({ error: 'Erro ao buscar usuário.' });
        }
    },

    async listAll(req: Request, res: Response) {
        try {
            const users = await prisma.user.findMany();
            res.json(users);
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
            res.status(500).json({ error: 'Erro ao buscar usuários.' });
        }
    },

    async getUserById(req: Request, res: Response) {
        const userId = parseInt(req.params.id);
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });
            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado.' });
            }
            res.json(user);
        } catch (error) {
            console.error('Erro ao buscar usuário por ID:', error);
            res.status(500).json({ error: 'Erro ao buscar usuário por ID.' });
        }
    },

    async create(req: Request, res: Response) {
        const { name, email, password, active = true } = req.body;
        const encryptedPassword = await bcrypt.hash(password, 10);
        try {
            const newUser = await prisma.user.create({
                data: { name, email, password: encryptedPassword, active }
            });
            res.status(201).json(newUser);
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    const target = (error.meta && error.meta.target) as string[];
    
                    if (target.includes('email')) {
                        return res.status(400).json({ error: 'E-mail de usuário já cadastrado.' });
                    }
                }
            }
            console.error('Erro ao criar usuário:', error);
            res.status(500).json({ error: 'Erro ao criar usuário.' });
        }
    },

    async update(req: AuthRequest, res: Response) {
        const userId = parseInt(req.params.id);
        const { name, email, password, active } = req.body;
        var newPassword = password ? password : null
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });
            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado.' });
            }
            if(userId==req.user.id&&!active)
                return res.status(409).json({ error: 'Não é possível inativar a si mesmo' });
            if(newPassword==null)
                newPassword = user.password
            else
                newPassword = await bcrypt.hash(newPassword, 10);
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: { name, email, password:newPassword, active }
            });
            res.json(updatedUser);
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    const target = (error.meta && error.meta.target) as string[];
    
                    if (target.includes('email')) {
                        return res.status(400).json({ error: 'E-mail de usuário já cadastrado.' });
                    }
                }
            }
            console.error('Erro ao criar usuário:', error);
            res.status(500).json({ error: 'Erro ao criar usuário.' });
        }
    },

    async listMovements(req: Request, res: Response) {
        const userId = parseInt(req.params.id);
      
        try {
          const movements = await prisma.movement.findMany({
            where: {
              userId: userId,
            },
            include: {
              product: true,
              user: true,
            },
            orderBy: {
                id: 'desc',
            },
          });
          
          res.json(movements);
        } catch (error) {
          console.error('Error fetching movements:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
      }
};

export default UserController;