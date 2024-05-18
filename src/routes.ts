import { Router } from 'express';
import UserController from './controllers/userController';
import ProductController from './controllers/productController';
import { auth } from './middlewares/auth';
import multer from 'multer';
const upload = multer();

export const router = Router();

router.post('/api/v1/login', UserController.login);

router.use(auth);
router.get('/api/v1/users',UserController.listAll);
router.get('/api/v1/user/:id', UserController.getUserById);
router.post('/api/v1/user', UserController.create);
router.put('/api/v1/user/:id', UserController.update);

router.get('/api/v1/products',ProductController.listAll);
router.get('/api/v1/product/:id', ProductController.getProductById);
router.post('/api/v1/product',upload.single('image'), ProductController.create);
router.put('/api/v1/product/:id', ProductController.update);
router.delete('/api/v1/product/:id', ProductController.delete);