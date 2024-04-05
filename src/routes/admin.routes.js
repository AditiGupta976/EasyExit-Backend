import { Router } from 'express';
import {
    addSupervisor,
    getSupervisor
} from '../controllers/admin.controllers.js';

const adminRouter = Router();

adminRouter.post('/supervisors/add', addSupervisor);
adminRouter.get('/supervisors', getSupervisor);

export default adminRouter;
