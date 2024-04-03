import { Router } from 'express';
import { getAllTokens } from '../controllers/manager.controllers.js';

const managerRouter = Router();

managerRouter.get('/alltokens', getAllTokens);

export default managerRouter;