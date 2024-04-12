import { Router } from 'express';
import { requestToken, getAcceptedOutpasses, getRejectedOutpasses } from '../controllers/user.controllers.js';

const userRouter = Router();

userRouter.post('/requestToken', requestToken);
userRouter.get('/approvedOutpass',getAcceptedOutpasses);
userRouter.get('/rejectedOutpass',getRejectedOutpasses);

export default userRouter;
