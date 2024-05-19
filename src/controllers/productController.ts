import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { format } from 'date-fns-tz';
import { AuthRequest } from '../types/AuthRequest'

const prisma = new PrismaClient();

const ProductController = {
    
    async listAll(req: Request, res: Response) {
        try {
            const products = await prisma.product.findMany();
            res.json(products);
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
            res.status(500).json({ error: 'Erro ao buscar produtos.' });
        }
    },

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

    async create(req: AuthRequest, res: Response) {
        const { name, description, value, minimum_value, quantity = 0 } = req.body;
        const image = req.file ? req.file.buffer : null;
        const now = new Date();
        const timeZone = 'America/Sao_Paulo';
        const nowInBrazil = format(now, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx", { timeZone });
    
        try {
            const newProduct = await prisma.product.create({
                data: {
                    name,
                    description,
                    value: parseFloat(value),
                    minimum_value: parseInt(minimum_value, 10),
                    image,
                    quantity: parseInt(quantity, 10)
                }
            });
    
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
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    const target = (error.meta && error.meta.target) as string[];
    
                    if (target.includes('name')) {
                        return res.status(400).json({ error: 'Nome do produto já existe.' });
                    } else if (target.includes('description')) {
                        return res.status(409).json({ error: 'Descrição do produto já existe.' });
                    }
                }
            }
            console.error('Erro ao criar produto:', error);
            res.status(500).json({ error: 'Erro ao criar produto.' });
        }
    },

    async update(req: AuthRequest, res: Response) {
        const productId = parseInt(req.params.id);
        const { name, description, value, minimum_value } = req.body;
        const image = req.file ? req.file.buffer : null;
        const quantity = req.body.quantity ? parseInt(req.body.quantity, 10) : null;
    
        try {
            const existingProduct = await prisma.product.findUnique({
                where: { id: productId },
            });
    
            if (!existingProduct) {
                return res.status(404).json({ error: 'Produto não encontrado.' });
            }
    
            const updatedData = {
                name,
                description,
                value: parseFloat(value),
                minimum_value: parseInt(minimum_value, 10),
                image: image !== null ? image : existingProduct.image,
                quantity: quantity !== null ? quantity : existingProduct.quantity,
            };
    
            const updatedProduct = await prisma.product.update({
                where: { id: productId },
                data: updatedData,
            });
    
            res.json(updatedProduct);
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    const target = (error.meta && error.meta.target) as string[];
    
                    if (target.includes('name')) {
                        return res.status(400).json({ error: 'Nome do produto já existe.' });
                    } else if (target.includes('description')) {
                        return res.status(409).json({ error: 'Descrição do produto já existe.' });
                    }
                }
            }
            console.error('Erro ao criar produto:', error);
            res.status(500).json({ error: 'Erro ao criar produto.' });
        }
    },     

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
    },

    async movement(req: AuthRequest, res: Response) {
        const productId = parseInt(req.params.id);
        const { type, quantity } = req.body;
        const now = new Date();
        const timeZone = 'America/Sao_Paulo';
        const nowInBrazil = format(now, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx", { timeZone });
        try {
            const existingProduct = await prisma.product.findUnique({
                where: { id: productId },
            });
    
            if (!existingProduct) {
                return res.status(404).json({ error: 'Produto não encontrado.' });
            }
            var newQuantity 
            if(type=="entrada"){
                newQuantity = existingProduct.quantity + parseInt(quantity)
            }
            else{
                newQuantity = existingProduct.quantity - parseInt(quantity)
            }
            const updatedData = {
                name: existingProduct.name,
                description: existingProduct.description,
                value: existingProduct.value,
                minimum_value: existingProduct.minimum_value,
                image: existingProduct.image,
                quantity: newQuantity,
            };
    
            const updatedProduct = await prisma.product.update({
                where: { id: productId },
                data: updatedData,
            });
            
            await prisma.movement.create({
                data: {
                    productId: productId,
                    userId: req.user.id,
                    type:  type,
                    balance: newQuantity,
                    quantity: quantity,
                    date: nowInBrazil
                }
            });
    
            res.status(201).json(updatedProduct);
        } catch (error) {
            console.error('Erro ao criar produto:', error);
            res.status(500).json({ error: 'Erro ao criar produto.' });
        }
    },

    async listMovements(req: Request, res: Response) {
        const productId = parseInt(req.params.id);
      
        try {
          const movements = await prisma.movement.findMany({
            where: {
              productId: productId,
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

export default ProductController;
