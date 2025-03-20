import { Request, Response } from 'express';
import Comment from '../models/Comment';
import Post from '../models/Post';
import { sendResponse } from '../utils/responseUtils';
import { Types } from 'mongoose'; // Импортируй Types из mongoose

class CommentController {
  // Добавление комментария
  public async addComment(req: Request, res: Response): Promise<void> {
    try {
      const { postId } = req.params;
      const { content } = req.body;
      const userId = req.user?.id;

      const post = await Post.findById(postId);
      if (!post) {
        return sendResponse(res, 404, { message: 'Post not found' });
      }

      const comment = new Comment({ user: userId, post: postId, content });
      await comment.save();

      post.comments.push(comment._id as Types.ObjectId);
      post.commentsCount += 1;
      await post.save();

      return sendResponse(res, 201, {
        message: 'Comment added successfully',
        data: comment,
      });
    } catch (error) {
      return sendResponse(res, 500, { message: 'Error adding comment' });
    }
  }

  // Редактирование комментария
  public async editComment(req: Request, res: Response): Promise<void> {
    try {
      const { commentId } = req.params;
      const { content } = req.body;
      const userId = req.user?.id;

      const comment = await Comment.findById(commentId);
      if (!comment) {
        return sendResponse(res, 404, { message: 'Comment not found' });
      }

      if (comment.user.toString() !== userId) {
        return sendResponse(res, 403, {
          message: 'You are not the owner of this comment',
        });
      }

      // Обновляем содержимое комментария
      comment.content = content;
      await comment.save();

      return sendResponse(res, 200, {
        message: 'Comment updated successfully',
        data: comment,
      });
    } catch (error) {
      return sendResponse(res, 500, { message: 'Error updating comment' });
    }
  }

  // Удаление комментария
  public async deleteComment(req: Request, res: Response): Promise<void> {
    try {
      const { commentId } = req.params;
      const userId = req.user?.id;

      const comment = await Comment.findById(commentId);
      if (!comment) {
        return sendResponse(res, 404, { message: 'Comment not found' });
      }

      if (comment.user.toString() !== userId) {
        return sendResponse(res, 403, {
          message: 'You are not the owner of this comment',
        });
      }

      await Comment.deleteOne({ _id: commentId });

      // Уменьшаем счетчик комментариев у поста
      await Post.findByIdAndUpdate(comment.post, {
        $pull: { comments: commentId },
        $inc: { commentsCount: -1 },
      });

      return sendResponse(res, 200, {
        message: 'Comment deleted successfully',
      });
    } catch (error) {
      return sendResponse(res, 500, { message: 'Error deleting comment' });
    }
  }
  // Добавление лайка к комментариям
  public async toggleLike(req: Request, res: Response): Promise<void> {
    try {
      const { commentId } = req.params;
      const userId = req.user?.id;

      const comment = await Comment.findById(commentId);
      if (!comment) {
        return sendResponse(res, 404, { message: 'Comment not found' });
      }

      const userObjectId = new Types.ObjectId(userId);
      const hasLiked = comment.likes.some((like) => like.equals(userObjectId));

      if (hasLiked) {
        // Удаляем лайк
        comment.likes = comment.likes.filter(
          (like) => !like.equals(userObjectId)
        );
        comment.likesCount -= 1;
        await comment.save();
        return sendResponse(res, 200, {
          message: 'Comment unliked',
          data: comment,
        });
      } else {
        // Добавляем лайк
        comment.likes.push(userObjectId);
        comment.likesCount += 1;
        await comment.save();
        return sendResponse(res, 200, {
          message: 'Comment liked',
          data: comment,
        });
      }
    } catch (error) {
      return sendResponse(res, 500, { message: 'Error toggling like' });
    }
  }

  // Добавление ответа (вложенного комментария)
  public async addReply(req: Request, res: Response): Promise<void> {
    try {
      const { commentId } = req.params;
      const userId = req.user?.id;
      const { content } = req.body;

      const parentComment = await Comment.findById(commentId);
      if (!parentComment) {
        return sendResponse(res, 404, { message: 'Parent comment not found' });
      }

      const reply = new Comment({
        user: userId,
        post: parentComment.post,
        content,
        likesCount: 0,
        likes: [],
        repliesCount: 0,
      });

      await reply.save();

      // Добавляем новый комментарий в поле replies родительского комментария
      parentComment.replies.push(reply._id as Types.ObjectId);
      parentComment.repliesCount += 1;
      await parentComment.save();

      return sendResponse(res, 200, {
        message: 'Reply added successfully',
        data: reply,
      });
    } catch (error) {
      return sendResponse(res, 500, { message: 'Error adding reply' });
    }
  }
}

export default new CommentController();
