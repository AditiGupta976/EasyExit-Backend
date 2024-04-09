import { Router } from 'express';
import authRouter from './auth.routes.js';
import managerRoutes from './manager.routes.js';
import checkerRouter from './checker.routes.js';
import adminRouter from './admin.routes.js';
import userRouter from './user.routes.js';
import profileRouter from './profile.routes.js';
import {
    isAdmin,
    isChecker,
    isManager,
    isPeoples
} from '../middlewares/roleVerification.middleware.js';
import userAuth from '../middlewares/auth.middleware.js';
import { middlewareEmailValidater } from '../validaters/email.validaters.js';
import { getOrganizations } from '../controllers/profile.controllers.js';

const router = Router();

router.use('/auth', middlewareEmailValidater, authRouter);
router.use('/admin', userAuth, isAdmin, adminRouter);
router.use('/manager', userAuth, isManager, managerRoutes);
router.use('/checker', userAuth, isChecker, checkerRouter);
router.use('/user', userAuth, isPeoples, userRouter);
router.use('/profile', userAuth, profileRouter);
router.get('/organization', getOrganizations);

export default router;
