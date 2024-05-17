import express from 'express';
import { router } from './routes';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());
app.use(router);

const PORT = 3030;

app.listen(PORT, () => {
    console.log(`Application started at ${PORT}`);
});