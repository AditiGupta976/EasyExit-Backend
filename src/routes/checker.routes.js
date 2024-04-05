import { Router } from 'express';
import {
    checkToken,
    getCheckedTokens
} from '../controllers/checker.controllers.js';
const checkerRouter = Router();

checkerRouter.patch('/checkToken', checkToken);
checkerRouter.get('/checkedTokens', getCheckedTokens);

export default checkerRouter;
