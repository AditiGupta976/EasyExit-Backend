import { Router } from 'express';
import {
    getAllTokens,
    getAcceptedToken,
    getRejectedToken,
    acceptToken,
    rejectToken
} from '../controllers/manager.controllers.js';

const managerRouter = Router();

managerRouter.get('/alltokens', getAllTokens);
managerRouter.get('/tokens/accepted', getAcceptedToken);
managerRouter.get('/tokens/rejected', getRejectedToken);
managerRouter.patch('/token/accept', acceptToken);
managerRouter.patch('/token/reject', rejectToken);

export default managerRouter;
