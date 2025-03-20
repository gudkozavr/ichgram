import { Router } from 'express';
import chatController from '../controllers/chatController';

const router = Router();

// Создание чата между двумя пользователями
router.post('/create', chatController.createChat);

// Отправка сообщения
router.post('/message', chatController.sendMessage);

// Получение всех сообщений для чата
router.get('/:chatId/messages', chatController.getMessages);

export default router;
