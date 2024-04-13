import { Router } from 'express';
import {
    adminRegister,
    login,
    peoplesRegister,
    supervisorRegister
} from '../controllers/auth.controllers.js';
import upload from '../middlewares/multer.middleware.js';
import { middlewareEmailValidater } from '../validaters/email.validaters.js';

const authRouter = Router();

authRouter.post('/login', middlewareEmailValidater, login);
authRouter.post(
    '/register/admin',
    upload.fields([
        { name: 'organizationLogo', maxCount: 1 },
        { name: 'profileImg', maxCount: 1 }
    ]),
    middlewareEmailValidater,
    adminRegister
);
authRouter.post(
    '/register/peoples',
    upload.single('profileImg'),
    middlewareEmailValidater,
    peoplesRegister
);
authRouter.post(
    '/register/supervisor',
    upload.single('profileImg'),
    middlewareEmailValidater,
    supervisorRegister
);

export default authRouter;
