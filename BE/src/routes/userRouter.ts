import { Router } from 'express';
import UserProfileController from '../controllers/userController';
import jwtMiddleware from '../middlewares/jwtMiddleware';

const router = Router();

router.get('/profile', jwtMiddleware, UserProfileController.getProfile);
router.get('/profile/:username', UserProfileController.getProfileByUsername);
router.post('/profile', jwtMiddleware, UserProfileController.createProfile);
router.put('/profile', jwtMiddleware, UserProfileController.updateProfile);
router.post('/search', UserProfileController.searchUsers)

export default router;
