import { Router } from 'express';

import {
    getProfile,
    updateProfile,
    deleteProfile
} from '../controllers/profile.controllers.js';

const profileRouter = Router();

profileRouter.get('/', getProfile);
profileRouter.put('/', updateProfile);
profileRouter.delete('/', deleteProfile);

export default profileRouter;
