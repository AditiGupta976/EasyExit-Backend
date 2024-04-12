import { Router } from 'express';
import {
    adminRegister,
    login,
    peoplesRegister,
    supervisorRegister
} from '../controllers/auth.controllers.js';
import upload from '../middlewares/multer.middleware.js';

const authRouter = Router();

authRouter.post('/login', login);
authRouter.post(
    '/register/admin',
    upload.fields([
        { name: 'organizationLogo', maxCount: 1 },
        { name: 'profileImg', maxCount: 1 }
    ]),
    adminRegister
);
authRouter.post(
    '/register/peoples',
    upload.single('profileImg'),
    peoplesRegister
);
authRouter.post(
    '/register/supervisor',
    upload.single('profileImg'),
    supervisorRegister
);

export default authRouter;
