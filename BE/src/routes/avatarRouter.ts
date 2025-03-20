
import express from 'express';
import upload from '../middlewares/uploadMiddlewere';
import jwtMiddleware from '../middlewares/jwtMiddleware';
import AvatarController from '../controllers/avatarController';

const router = express.Router();

// Загрузка аватара
router.post(
  '/upload-avatar',
  jwtMiddleware, 
  upload.single('avatar'), 
  AvatarController.uploadAvatar 
);

// Получение аватара по имени пользователя
router.get('/avatar/:username', AvatarController.getAvatar);

// Редактирование аватара
router.put(
  '/edit-avatar',
  jwtMiddleware, 
  upload.single('avatar'),
  AvatarController.editAvatar 
);

// Удаление аватара
// router.delete(
//   '/avatar',
//   jwtMiddleware, 
//   AvatarController.deleteAvatar 
// );

export default router;
