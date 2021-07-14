import SessionController from '@controllers/SessionController';
import { UsersController } from '@controllers/UserController';
import { Router } from 'express';
import auth from './middlewares/auth';

const userController = new UsersController();
const sessionController = new SessionController();

const router = Router();

router.post('/login', sessionController.create);

router.post('/register-user', userController.create);

router.use(auth);

router.get('/users', userController.index);
router.put('/edit-user/:id', userController.edit);
router.delete('/delete-user/:id', userController.delete);

export { router };
