import postController from '../controllers/postController';
import upload from '../middlewares/uploadMiddlewere';
import { Router } from 'express';
import jwtMiddleware from '../middlewares/jwtMiddleware';

const router: Router = Router();

router.post(
  '/create',
  jwtMiddleware,
  upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'video', maxCount: 1 },
  ]),
  postController.createPost
);

router.get('/user-posts/:username', postController.getAllUserPost);
router.get('/following', jwtMiddleware, postController.getPostsForFollowing)
router.get('/all-users-posts',postController.getAllUsers)
router.put(
  '/:postId',
  jwtMiddleware,
  upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'video', maxCount: 1 },
  ]),
  postController.editPost
);
router.get('/:postId', postController.getPost);
router.delete('/:postId', jwtMiddleware, postController.deletePost)
router.post('/:postId/like', jwtMiddleware, postController.toggleLike)
router.post('/:postId/repost', jwtMiddleware, postController.addRepost);
export default router;
