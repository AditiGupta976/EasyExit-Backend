import { Router } from 'express';
import {
    adminRegister,
    login,
    peoplesRegister
} from '../controllers/auth.controllers.js';

const authRouter = Router();

authRouter.post('/login', login);
authRouter.post('/register/admin', adminRegister);
authRouter.post('/register/peoples', peoplesRegister);
// authRouter.post('/register/manager');

export default authRouter;
