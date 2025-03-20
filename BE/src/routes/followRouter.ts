import express from 'express';
import followController from '../controllers/followController';
import jwtMiddleware from '../middlewares/jwtMiddleware';

const router = express.Router();

// Подписаться/отписаться
router.post(
  '/follow/:username',
  jwtMiddleware,
 followController.toggleFollow
);

export default router;
