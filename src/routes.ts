import { Router } from 'express';
import UserController from './controllers/userController';
//import ProductController from './controllers/productController';
import { auth } from './middlewares/auth';

export const router = Router();

// router.post('/login', UserController.login);

// router.use(auth);
router.get('/users',UserController.listAll);
router.get('/user/:id', UserController.getUserById);
router.post('/user', UserController.create);
router.put('/user/:id', UserController.update);
router.delete('/user/:id', UserController.delete);

// router.get('/products',ProductController.listAll);
// router.get('/product/:id', ProductController.getUserById);
// router.post('/product', ProductController.create);
// router.put('/product/:id', ProductController.update);
// router.delete('/product/:id', ProductController.delete);