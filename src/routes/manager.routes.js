import { Router } from 'express';
import {
    getAcceptedToken,
    getRejectedToken,
    acceptToken,
    rejectToken,
    tokenStats,
    getPendingToken
} from '../controllers/manager.controllers.js';

const managerRouter = Router();

managerRouter.get('/tokens/pending', getPendingToken);
managerRouter.get('/tokens/accepted', getAcceptedToken);
managerRouter.get('/tokens/rejected', getRejectedToken);
managerRouter.patch('/token/accept', acceptToken);
managerRouter.patch('/token/reject', rejectToken);
managerRouter.get('/tokens/stats', tokenStats);

export default managerRouter;
