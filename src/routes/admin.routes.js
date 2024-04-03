import { Router } from 'express';
import { addSupervisor } from '../controllers/admin.controllers.js';

const adminRouter = Router();

adminRouter.post('/add/supervisors', addSupervisor);

export default adminRouter;
