import { Router } from 'express';
import { checkToken } from '../controllers/checker.controllers.js';
const checkerRouter = Router();

checkerRouter.post('/checkToken', checkToken);

export default checkerRouter;
