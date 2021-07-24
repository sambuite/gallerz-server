import { ProductController } from '@controllers/ProductController';
import SessionController from '@controllers/SessionController';
import { UsersController } from '@controllers/UserController';
import { Router } from 'express';
import auth from './middlewares/auth';

const userController = new UsersController();
const sessionController = new SessionController();
const productController = new ProductController();

const router = Router();

router.post('/login', sessionController.create);

router.post('/register-user', userController.create);

router.use(auth);

router.get('/users', userController.index);
router.put('/edit-user/:id', userController.edit);
router.delete('/delete-user/:id', userController.delete);

router.get('/products', productController.index);
router.post('/register-product', productController.create);
router.put('/edit-product/:id', productController.edit);
router.delete('/delete-product/:id', productController.delete);

export { router };
