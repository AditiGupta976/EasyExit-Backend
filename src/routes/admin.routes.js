import { Router } from 'express';
import {
    addSupervisor,
    getSupervisor,
    getCheckInOutpasses,
    getCheckoutOutpass
} from '../controllers/admin.controllers.js';

const adminRouter = Router();

adminRouter.post('/supervisors', addSupervisor);
adminRouter.get('/supervisors', getSupervisor);
adminRouter.get('/checkIn',getCheckInOutpasses);
adminRouter.get('/checkOut',getCheckoutOutpass);

export default adminRouter;
