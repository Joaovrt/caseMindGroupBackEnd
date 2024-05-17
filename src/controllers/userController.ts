import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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
                return response.status(200).json({  // Adicione um return aqui
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    token: token
                });
            } else {
                return response.status(401).json({ error: 'Usuário ou senha incorretos.' }); // Adicione um return aqui
            }
            
        } catch (error) {
            console.error('Erro ao buscar usuário:', error);
            response.status(500).json({ error: 'Erro ao buscar usuário.' });
        }
    },

    // Listar todos os usuários
    async listAll(req: Request, res: Response) {
        try {
            const users = await prisma.user.findMany();
            res.json(users);
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
            res.status(500).json({ error: 'Erro ao buscar usuários.' });
        }
    },

    // Obter usuário por ID
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

    // Criar novo usuário
    async create(req: Request, res: Response) {
        const { name, email, password } = req.body;
        const encryptedPassword = await bcrypt.hash(password, 10);
        try {
            const newUser = await prisma.user.create({
                data: { name, email, password: encryptedPassword }
            });
            res.status(201).json(newUser);
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            res.status(500).json({ error: 'Erro ao criar usuário.' });
        }
    },

    // Atualizar usuário por ID
    async update(req: Request, res: Response) {
        const userId = parseInt(req.params.id);
        const { name, email, password, active } = req.body;
        try {
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: { name, email, password, active }
            });
            res.json(updatedUser);
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            res.status(500).json({ error: 'Erro ao atualizar usuário.' });
        }
    }
};

export default UserController;