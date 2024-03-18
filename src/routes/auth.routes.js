import { Router } from 'express';
import {
    adminRegister,
    login,
    peoplesRegister,
    supervisorRegister,
    validate
} from '../controllers/auth.controllers.js';

const authRouter = Router();

authRouter.post('/login', login);
authRouter.post('/register/admin', adminRegister);
authRouter.post('/register/peoples', peoplesRegister);
authRouter.post('/register/supervisor', supervisorRegister); //Manager and checker
authRouter.post('/validation', validate);

export default authRouter;
