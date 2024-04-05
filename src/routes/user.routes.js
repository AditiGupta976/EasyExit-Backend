import { Router } from 'express';
import { requestToken } from '../controllers/user.controllers.js';

const userRouter = Router();

userRouter.post('/requestToken', requestToken);

export default userRouter;
