import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { toZonedTime, format } from 'date-fns-tz';

const prisma = new PrismaClient();

const ProductController = {
    // Listar todos os produtos
    async listAll(req: Request, res: Response) {
        try {
            const products = await prisma.product.findMany();
            res.json(products);
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
            res.status(500).json({ error: 'Erro ao buscar produtos.' });
        }
    },

    // Obter produto por ID
    async getProductById(req: Request, res: Response) {
        const productId = parseInt(req.params.id);
        try {
            const product = await prisma.product.findUnique({
                where: { id: productId }
            });
            if (!product) {
                return res.status(404).json({ error: 'Produto não encontrado.' });
            }
            res.json(product);
        } catch (error) {
            console.error('Erro ao buscar produto por ID:', error);
            res.status(500).json({ error: 'Erro ao buscar produto por ID.' });
        }
    },

    // Criar novo produto
    async create(req: Request, res: Response) {
        const { name, description, value, minimum_value, image, quantity = 0, userId } = req.body;
        const now = new Date();
        const timeZone = 'America/Sao_Paulo';
        const nowInBrazil = format(toZonedTime(now, timeZone), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx", { timeZone });
        try {
            const newProduct = await prisma.product.create({
                data: { name, description, value, minimum_value, image }
            });

            // Criar movimento de entrada
            await prisma.movement.create({
                data: {
                    productId: newProduct.id,
                    userId: userId,
                    type: 'entrada',
                    balance: quantity,
                    quantity: quantity,
                    date: nowInBrazil
                }
            });

            res.status(201).json(newProduct);
        } catch (error) {
            console.error('Erro ao criar produto:', error);
            res.status(500).json({ error: 'Erro ao criar produto.' });
        }
    },

    // Atualizar produto por ID
    async update(req: Request, res: Response) {
        const productId = parseInt(req.params.id);
        const { name, description, value, minimum_value, image } = req.body;
        try {
            const updatedProduct = await prisma.product.update({
                where: { id: productId },
                data: { name, description, value, minimum_value, image }
            });
            res.json(updatedProduct);
        } catch (error) {
            console.error('Erro ao atualizar produto:', error);
            res.status(500).json({ error: 'Erro ao atualizar produto.' });
        }
    },

    // Deletar produto por ID
    async delete(req: Request, res: Response) {
        const productId = parseInt(req.params.id);
        try {
            await prisma.product.delete({
                where: { id: productId }
            });
            res.json({ message: 'Produto deletado com sucesso.' });
        } catch (error) {
            console.error('Erro ao deletar produto:', error);
            res.status(500).json({ error: 'Erro ao deletar produto.' });
        }
    }
};

export default ProductController;
