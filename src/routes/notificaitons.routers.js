import { Router } from 'express';

import {
    sendNotificationToTopic,
    getNotification
} from '../controllers/notifications.controllers.js';
import {
    isSuperUser
} from '../middlewares/roleVerification.middleware.js';
const notificationRouter = Router();

notificationRouter.post('/', isSuperUser, sendNotificationToTopic);
notificationRouter.get('/', getNotification);

export default notificationRouter;
