import commentController from '../controllers/commentController';
import jwtMiddleware from '../middlewares/jwtMiddleware';
import { Router } from 'express';
const router: Router = Router();

router.post('/post/:postId/comment', jwtMiddleware, commentController.addComment);
router.put('/comment/:commentId', jwtMiddleware, commentController.editComment);
router.delete('/comment/:commentId', jwtMiddleware, commentController.deleteComment);
router.post(
  '/comment/:commentId/reply',
  jwtMiddleware,
  commentController.addReply
);
router.post(
  '/comment/:commentId/togglelike',
  jwtMiddleware,
  commentController.toggleLike
);
export default router;
