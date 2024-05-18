import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { toZonedTime, format } from 'date-fns-tz';
import { AuthRequest } from '../types/AuthRequest'

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
    async create(req: AuthRequest, res: Response) {
        const { name, description, value, minimum_value, quantity = 0 } = req.body;
        const image = req.file ? req.file.buffer : null;
        const now = new Date();
        const timeZone = 'America/Sao_Paulo';
        const nowInBrazil = format(now, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx", { timeZone });
    
        try {
            const newProduct = await prisma.product.create({
                data: { name, description, value: parseFloat(value), minimum_value: parseInt(minimum_value, 10), image, quantity: parseInt(quantity, 10) }
            });
    
            // Criar movimento de entrada
            await prisma.movement.create({
                data: {
                    productId: newProduct.id,
                    userId: req.user.id,
                    type: 'entrada',
                    balance: parseInt(quantity, 10),
                    quantity: parseInt(quantity, 10),
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
    async update(req: AuthRequest, res: Response) {
        const productId = parseInt(req.params.id);
        const { name, description, value, minimum_value, image, quantity } = req.body;
        try {
            const product = await prisma.product.findUnique({
                where: { id: productId }
            });
            if (!product) {
                return res.status(404).json({ error: 'Produto não encontrado.' });
            }
            if(quantity!=product.quantity){
                const now = new Date();
                const timeZone = 'America/Sao_Paulo';
                const nowInBrazil = format(toZonedTime(now, timeZone), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx", { timeZone });
                if(quantity<product.quantity){
                    await prisma.movement.create({
                        data: {
                            productId: product.id,
                            userId: req.user.id,
                            type: 'saida',
                            balance: quantity,
                            quantity: product.quantity-quantity,
                            date: nowInBrazil
                        }
                    });
                }
                else{
                    await prisma.movement.create({
                        data: {
                            productId: product.id,
                            userId: req.user.id,
                            type: 'entrada',
                            balance: quantity,
                            quantity: product.quantity+quantity,
                            date: nowInBrazil
                        }
                    });
                }
            }
            const updatedProduct = await prisma.product.update({
                where: { id: productId },
                data: { name, description, value, minimum_value, image, quantity }
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
