import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const UserController = {
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
        try {
            const newUser = await prisma.user.create({
                data: { name, email, password }
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
        const { name, email, password } = req.body;
        try {
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: { name, email, password }
            });
            res.json(updatedUser);
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            res.status(500).json({ error: 'Erro ao atualizar usuário.' });
        }
    },

    // Deletar usuário por ID
    async delete(req: Request, res: Response) {
        const userId = parseInt(req.params.id);
        try {
            await prisma.user.delete({
                where: { id: userId }
            });
            res.json({ message: 'Usuário deletado com sucesso.' });
        } catch (error) {
            console.error('Erro ao deletar usuário:', error);
            res.status(500).json({ error: 'Erro ao deletar usuário.' });
        }
    }
};

export default UserController;