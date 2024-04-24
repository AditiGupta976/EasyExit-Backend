import { Router } from 'express';
import {
    requestToken,
    getAcceptedOutpasses,
    getRejectedOutpasses,
    getToken,
    getPendingOutpasses
} from '../controllers/user.controllers.js';

const userRouter = Router();

userRouter.post('/requestToken', requestToken);
userRouter.get('/approvedOutpass', getAcceptedOutpasses);
userRouter.get('/rejectedOutpass', getRejectedOutpasses);
userRouter.get('/pendingOutpass', getPendingOutpasses);
userRouter.get('/getToken', getToken);

export default userRouter;
