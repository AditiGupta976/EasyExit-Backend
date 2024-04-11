import { Router } from 'express';

import {
    getProfile,
    updateProfile,
    deleteProfile
} from '../controllers/profile.controllers.js';
import upload from '../middlewares/multer.middleware.js';

const profileRouter = Router();

profileRouter.get('/', getProfile);
profileRouter.put('/', upload.single('profileImg'), updateProfile);
profileRouter.delete('/', deleteProfile);

export default profileRouter;
