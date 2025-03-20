import mongoose from 'mongoose';
import { Request, Response } from 'express';
import Post from '../models/Post';
import UserProfile from '../models/UserProfile';
import User from '../models/User';
import { Types } from 'mongoose';
import { FileCompressor } from '../utils/fileCompressor';
import { FileUploader } from '../utils/fileUplouder';
import { sendResponse } from '../utils/responseUtils';
import { extractPublicId } from '../utils/extractPublicId';

export interface IFormattedPost {
  _id: Types.ObjectId;
  content: string;
  imageUrls: string[];
  videoUrl: string;
  createdAt: Date | string;
  user: {
    username: string;
    avatar?: string;
  };
  likesCount: number;
  likeId: string;
}
class PostController {
  // Создание поста
  // public async createPost(req: Request, res: Response): Promise<void> {
  //   try {
  //     const imageUrls: string[] = [];
  //     let videoUrl: string | undefined = '';

  //     // Проверяем наличие файлов в запросе
  //     if (req.files && typeof req.files === 'object') {
  //       const files = req.files as {
  //         [fieldname: string]: Express.Multer.File[];
  //       };
  //       console.log(files);

  //       // Обработка изображений
  //       if (files['images']) {
  //         const images = files['images'];
  //         for (const image of images) {
  //           const compressedImage = await FileCompressor.compressImage(
  //             image.buffer
  //           );
  //           const imageUploadUrl = await FileUploader.uploadToCloudinary(
  //             compressedImage,
  //             'image'
  //           );
  //           if (imageUploadUrl) imageUrls.push(imageUploadUrl);
  //         }
  //       }

  //       // Обработка видео
  //       if (files['video']) {
  //         const video = files['video'][0];
  //         const compressedVideo = await FileCompressor.compressVideo(
  //           video.buffer
  //         );
  //         const videoUploadUrl = await FileUploader.uploadToCloudinary(
  //           compressedVideo,
  //           'video'
  //         );
  //         if (videoUploadUrl) videoUrl = videoUploadUrl;
  //       }
  //     }

  //     // Если не загружены изображения или видео, отправляем ошибку
  //     if (imageUrls.length === 0 && !videoUrl) {
  //       return sendResponse(res, 400, {
  //         message: 'No images or videos uploaded',
  //       });
  //     }

  //     // Создание поста
  //     const post = new Post({
  //       user: req.user?.id,
  //       content: req.body.content || '',
  //       imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
  //       videoUrl: videoUrl ?? undefined,
  //       likesCount: 0,
  //       likes: [],
  //       commentsCount: 0,
  //       comments: [],
  //       repostsCount: 0,
  //       reposts: [],
  //     });

  //     // Сохраняем пост в базе данных
  //     await post.save();

  //     // Увеличиваем postsCount для пользователя
  //     await UserProfile.findOneAndUpdate(
  //       { user: req.user?.id },
  //       { $inc: { postsCount: 1 } } // Увеличиваем postsCount на 1
  //     );

  //     return sendResponse(res, 201, {
  //       message: 'Post successfully created',
  //       data: { post_id: post._id, ...post.toObject() },
  //     });
  //   } catch (error) {
  //     console.error('Error creating post:', error);
  //     return sendResponse(res, 500, {
  //       message: 'Error creating post',
  //       data: {
  //         error: error instanceof Error ? error.message : 'Unknown error',
  //       },
  //     });
  //   }
  // }
  public async createPost(req: Request, res: Response): Promise<void> {
    try {
      const imageUrls: string[] = [];
      let videoUrl: string | undefined = '';

      // Проверяем наличие файлов в запросе
      if (req.files && typeof req.files === 'object') {
        const files = req.files as {
          [fieldname: string]: Express.Multer.File[];
        };
        console.log(files);

        // Обработка изображений
        if (files['images']) {
          const images = files['images'];
          for (const image of images) {
            const compressedImage = await FileCompressor.compressImage(
              image.buffer
            );
            const imageUploadUrl = await FileUploader.uploadToCloudinary(
              compressedImage,
              'image'
            );
            if (imageUploadUrl) imageUrls.push(imageUploadUrl);
          }
        }

        // Обработка видео
        if (files['video']) {
          const video = files['video'][0];
          const compressedVideo = await FileCompressor.compressVideo(
            video.buffer
          );
          const videoUploadUrl = await FileUploader.uploadToCloudinary(
            compressedVideo,
            'video'
          );
          if (videoUploadUrl) videoUrl = videoUploadUrl;
        }
      }

      // Если не загружены изображения или видео, отправляем ошибку
      if (imageUrls.length === 0 && !videoUrl) {
        return sendResponse(res, 400, {
          message: 'No images or videos uploaded',
        });
      }

      // Если content не передано, устанавливаем значение по умолчанию (например, пустую строку)
      const content = req.body.content || '';

      // Создание поста
      const post = new Post({
        user: req.user?.id,
        content: content,
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
        videoUrl: videoUrl ?? undefined,
        likesCount: 0,
        likes: [],
        commentsCount: 0,
        comments: [],
        repostsCount: 0,
        reposts: [],
      });

      // Сохраняем пост в базе данных
      await post.save();

      // Увеличиваем postsCount для пользователя
      await UserProfile.findOneAndUpdate(
        { user: req.user?.id },
        { $inc: { postsCount: 1 } } // Увеличиваем postsCount на 1
      );

      return sendResponse(res, 201, {
        message: 'Post successfully created',
        data: { post_id: post._id, ...post.toObject() },
      });
    } catch (error) {
      console.error('Error creating post:', error);
      return sendResponse(res, 500, {
        message: 'Error creating post',
        data: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  }
  public async getPost(req: Request, res: Response): Promise<void> {
    try {
      console.log('Registered models:', mongoose.modelNames());
      const { postId } = req.params;

      console.log('Received postId:', postId);

      if (!mongoose.Types.ObjectId.isValid(postId)) {
        console.log('Invalid post ID:', postId);
        return sendResponse(res, 400, { message: 'Invalid post ID' });
      }

      const post = await Post.aggregate([
        {
          $match: { _id: new mongoose.Types.ObjectId(postId) },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'userDetails',
          },
        },
        { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'userprofiles',
            localField: 'userDetails.profile',
            foreignField: '_id',
            as: 'userProfile',
          },
        },
        { $unwind: { path: '$userProfile', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'comments',
            localField: '_id',
            foreignField: 'post',
            as: 'comments',
          },
        },
        {
          $unwind: {
            path: '$comments',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'comments.user',
            foreignField: '_id',
            as: 'comments.userDetails',
          },
        },
        {
          $unwind: {
            path: '$comments.userDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'userprofiles',
            localField: 'comments.userDetails.profile',
            foreignField: '_id',
            as: 'comments.userProfile',
          },
        },
        {
          $unwind: {
            path: '$comments.userProfile',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $group: {
            _id: '$_id',
            content: { $first: '$content' },
            imageUrls: { $first: '$imageUrls' },
            videoUrl: { $first: '$videoUrl' },
            likesCount: { $first: '$likesCount' },
            commentsCount: { $first: '$commentsCount' },
            createdAt: { $first: '$createdAt' },
            userDetails: { $first: '$userDetails' },
            userProfile: { $first: '$userProfile' },
            comments: {
              $push: {
                _id: '$comments._id',
                content: { $ifNull: ['$comments.content', 'No content'] },
                likes: { $ifNull: ['$comments.likes', []] }, //{ $ifNull: ['$comments.likes', 'No content'] },  Добавляем массив ID пользователей, которые лайкнули комментарий
                repliesCount: { $ifNull: ['$comments.repliesCount', 0] },
                username: {
                  $ifNull: ['$comments.userDetails.username', 'Anonymous'],
                },
                avatar: {
                  $ifNull: [
                    '$comments.userProfile.avatar',
                    'default-avatar.png',
                  ],
                },
              },
            },
          },
        },
      ]);

      if (!post || post.length === 0) {
        return sendResponse(res, 404, { message: 'Post not found' });
      }

      console.log('Post with comments:', post[0]);

      return sendResponse(res, 200, {
        message: 'Post retrieved successfully',
        data: post[0],
      });
    } catch (error) {
      console.error('Error retrieving post with comments:', error);
      return sendResponse(res, 500, {
        message: 'Error retrieving post with comments',
        data: { error },
      });
    }
  }
  public async getAllUserPost(req: Request, res: Response): Promise<void> {
    try {
      // Получаем имя пользователя из параметров URL
      const { username } = req.params;

      if (!username) {
        sendResponse(res, 400, { message: 'Username is required' });
        return;
      }

      // Ищем пользователя по имени пользователя и подгружаем профиль
      const user = await User.findOne({ username })
        .select('_id username profile')
        .populate({
          path: 'profile',
          select:
            'avatar bio gender address interests occupation followersCount followingCount',
        })
        .lean(); // Используем .lean() для преобразования в обычный объект

      if (!user) {
        sendResponse(res, 404, { message: 'User not found' });
        return;
      }

      const userPosts = await Post.find({ user: user._id })
        .populate({
          path: 'user',
          select: 'username profile',
          populate: { path: 'profile', select: 'avatar bio gender address' },
        })
        .populate({
          path: 'comments',
          populate: [
            {
              path: 'user',
              select: 'username profile',
              populate: { path: 'profile', select: 'avatar bio gender' },
            },
            {
              path: 'replies',
              select: 'content user',
              populate: {
                path: 'user',
                select: 'username profile',
                populate: { path: 'profile', select: 'avatar bio gender' },
              },
            },
          ],
        })
        .sort({ createdAt: -1 })
        .lean(); // Используем .lean() для преобразования в обычный объект

      // Форматируем данные
      const formattedPosts = userPosts.map((post) => ({
        ...post,
        likes: post.likes.map((like: any) => like.toString()), // Преобразуем ObjectId в строку
      }));

      sendResponse(res, 200, { message: 'User posts', data: formattedPosts });
    } catch (error) {
      console.error('Error fetching user posts:', error);
      sendResponse(res, 500, { message: 'Internal Server Error' });
    }
  }

  public async getPostsForFollowing(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const currentUserId = req.user?.id;

      if (!currentUserId) {
        sendResponse(res, 400, { message: 'User ID is required' });
        return;
      }

      const userProfile = await UserProfile.findOne({
        user: currentUserId,
      }).populate('following'); // Загрузка пользователей из подписок

      if (!userProfile) {
        sendResponse(res, 404, { message: 'User profile not found' });
        return;
      }

      const followingUsers = userProfile.following;

      if (!followingUsers.length) {
        sendResponse(res, 200, {
          message: 'No posts found',
          data: { posts: [] },
        });
        return;
      }

      // Запрашиваем посты пользователей из списка подписок
      const posts = await Post.aggregate([
        { $match: { user: { $in: followingUsers } } }, // Фильтруем посты подписанных пользователей
        { $sort: { createdAt: -1 } }, // Сортировка по дате создания
        {
          $lookup: {
            from: 'users', // Название коллекции пользователей
            localField: 'user',
            foreignField: '_id',
            as: 'userData',
          },
        },
        { $unwind: '$userData' }, // Разворачиваем массив пользователей
        {
          $lookup: {
            from: 'userprofiles', // Название коллекции профилей пользователей
            localField: 'userData.profile',
            foreignField: '_id',
            as: 'profileData',
          },
        },
        { $unwind: '$profileData' }, // Разворачиваем массив профилей
        {
          $project: {
            _id: 1,
            content: 1,
            imageUrls: 1,
            videoUrl: 1,
            createdAt: 1,
            likesCount: 1, // Включаем количество лайков
            likes: 1, // Включаем массив лайков
            'userData.username': 1,
            'profileData.avatar': 1, // Прямо выбираем avatar
          },
        },
      ]);
      console.log(posts);

      // Проверяем, что posts - это массив
      if (!Array.isArray(posts)) {
        sendResponse(res, 200, {
          message: 'No posts found',
          data: { posts: [] },
        });
        return;
      }

      // Форматируем и отправляем данные
      const formattedPosts = posts.map((post) => ({
        _id: post._id,
        content: post.content || '',
        imageUrls: post.imageUrls || [],
        videoUrl: post.videoUrl || '',
        createdAt: post.createdAt.toISOString(),
        likesCount: post.likesCount,
        likes: post.likes?.map((likeId: any) => likeId.toString()) || [],
        user: {
          username: post.userData.username,
          avatar: post.profileData.avatar || '', // Прямо получаем avatar
        },
      }));

      sendResponse(res, 200, {
        message: 'Posts fetched successfully',
        data: { posts: formattedPosts },
      });
    } catch (error) {
      console.error('Error fetching posts:', error);
      sendResponse(res, 500, { message: 'Server error' });
    }
  }
  public async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await User.aggregate([
        {
          $lookup: {
            from: 'userprofiles', // Коллекция профилей пользователей
            localField: '_id',
            foreignField: 'user',
            as: 'profileData',
          },
        },
        { $unwind: { path: '$profileData', preserveNullAndEmptyArrays: true } }, // Разворачиваем массив профилей
        {
          $lookup: {
            from: 'posts', // Коллекция постов
            localField: '_id',
            foreignField: 'user',
            as: 'postsData',
          },
        },
        { $sort: { createdAt: -1 } }, // Сортировка по дате создания пользователей
        {
          $project: {
            _id: 1,
            username: 1,
            email: 1,
            createdAt: 1,
            'profileData.avatar': 1, // Включаем avatar
            'postsData._id': 1, // Идентификатор постов
            'postsData.content': 1, // Контент постов
            'postsData.imageUrls': 1, // URL изображений
            'postsData.videoUrl': 1, // URL видео
            'postsData.createdAt': 1, // Дата создания поста
            'postsData.likesCount': 1, // Количество лайков
            'postsData.likes': 1, // Лайки
          },
        },
      ]);

      if (!users || users.length === 0) {
        sendResponse(res, 200, {
          message: 'No users found',
          data: { users: [] },
        });
        return;
      }

      const formattedUsers = users.map((user) => ({
        _id: user._id,
        username: user.username || '',
        createdAt: user.createdAt?.toISOString() || '',
        avatar: user.profileData?.avatar || '',
        posts:
          user.postsData?.map((post: any) => ({
            _id: post._id,
            content: post.content || '',
            imageUrls: post.imageUrls || [],
            videoUrl: post.videoUrl || '',
            createdAt: post.createdAt?.toISOString() || '',
            likesCount: post.likesCount || 0,
            likes: post.likes?.map((likeId: any) => likeId.toString()) || [],
          })) || [],
      }));

      sendResponse(res, 200, {
        message: 'Users fetched successfully',
        data: { users: formattedUsers },
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      sendResponse(res, 500, {
        message: 'Server error',
      });
    }
  }

  public async editPost(req: Request, res: Response): Promise<void> {
    try {
      const { postId } = req.params;
      const userId = req.user?.id;
      const { content, videoUrl } = req.body;
      const post = await Post.findById(postId);
      if (!post) {
        return sendResponse(res, 404, { message: 'Post not found' });
      }

      if (post.user.toString() !== userId) {
        return sendResponse(res, 403, {
          message: 'You are not the owner of this post',
        });
      }

      // Обработка файлов (если они есть)
      const updatedImageUrls: string[] = [];
      let updatedVideoUrl: string | undefined = videoUrl;

      if (req.files && typeof req.files === 'object') {
        const files = req.files as {
          [fieldname: string]: Express.Multer.File[];
        };
        console.log(files);

        // Обработка новых изображений
        if (files['images']) {
          const images = files['images'];
          for (const image of images) {
            const compressedImage = await FileCompressor.compressImage(
              image.buffer
            );
            const imageUploadUrl = await FileUploader.uploadToCloudinary(
              compressedImage,
              'image'
            );
            if (imageUploadUrl) updatedImageUrls.push(imageUploadUrl);
          }
        }

        // Обработка нового видео
        if (files['video']) {
          const video = files['video'][0];
          const compressedVideo = await FileCompressor.compressVideo(
            video.buffer
          );
          const videoUploadUrl = await FileUploader.uploadToCloudinary(
            compressedVideo,
            'video'
          );
          if (videoUploadUrl) updatedVideoUrl = videoUploadUrl;
        }
      }

      // Обновляем информацию о посте
      post.content = content ?? post.content;
      post.imageUrls =
        updatedImageUrls.length > 0 ? updatedImageUrls : post.imageUrls;
      post.videoUrl = updatedVideoUrl ?? post.videoUrl;

      await post.save();
      return sendResponse(res, 200, {
        message: 'Post updated successfully',
        data: post,
      });
    } catch (error) {
      return sendResponse(res, 500, {
        message: 'Error editing post',
      });
    }
  }

  public async deletePost(req: Request, res: Response): Promise<void> {
    try {
      const { postId } = req.params;
      const userId = req.user?.id;
      const post = await Post.findById(postId);

      if (!post) {
        return sendResponse(res, 404, { message: 'Post not found' });
      }

      if (post.user.toString() !== userId) {
        return sendResponse(res, 403, {
          message: 'You are not the owner of this post',
        });
      }

      // Удаление файлов из Cloudinary
      if (post.imageUrls && post.imageUrls.length > 0) {
        for (const imageUrl of post.imageUrls) {
          const publicId = extractPublicId(imageUrl);
          if (publicId) {
            await FileUploader.deleteFromCloudinary(publicId);
          }
        }
      }

      // Удаляем видео, если оно есть
      if (post.videoUrl) {
        const publicId = extractPublicId(post.videoUrl);
        if (publicId) {
          await FileUploader.deleteFromCloudinary(publicId);
        }
      }

      // Удаление поста из базы данных
      await post.deleteOne();

      return sendResponse(res, 200, {
        message: 'Post and associated files deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      return sendResponse(res, 500, {
        message: 'Error deleting post',
      });
    }
  }
  public async toggleLike(req: Request, res: Response): Promise<void> {
    try {
      const { postId } = req.params;
      const userId = req.user?.id;

      const post = await Post.findById(postId);
      if (!post) {
        return sendResponse(res, 404, { message: 'Post not found' });
      }

      // Если лайк уже поставлен — удаляем лайк
      if (userId && post.likes.includes(new Types.ObjectId(userId))) {
        // Удаляем лайк и уменьшаем счетчик
        post.likes = post.likes.filter((like) => like.toString() !== userId);
        post.likesCount -= 1;
      } else {
        // Если лайк не поставлен — добавляем лайк и увеличиваем счетчик
        post.likes.push(new Types.ObjectId(userId));
        post.likesCount += 1;
      }

      await post.save();

      return sendResponse(res, 200, {
        message: post.likes.includes(new Types.ObjectId(userId))
          ? 'Post liked successfully'
          : 'Post unliked successfully',
        data: post,
      });
    } catch (error) {
      return sendResponse(res, 500, { message: 'Error toggling like' });
    }
  }
  public async addRepost(req: Request, res: Response): Promise<void> {
    try {
      const { postId } = req.params;
      const userId = req.user?.id;

      const post = await Post.findById(postId);
      if (!post) {
        return sendResponse(res, 404, { message: 'Post not found' });
      }

      // Проверка, если пост уже был репостнут этим пользователем
      if (post.reposts.includes(new Types.ObjectId(userId))) {
        return sendResponse(res, 400, {
          message: 'You have already reposted this post',
        });
      }

      // Добавляем репост и увеличиваем счетчик
      post.reposts.push(new Types.ObjectId(userId));
      post.repostsCount += 1;
      await post.save();

      // Теперь добавляем этот пост в репосты профиля пользователя
      const userProfile = await UserProfile.findOne({ user: userId });
      if (!userProfile) {
        return sendResponse(res, 404, { message: 'User profile not found' });
      }

      // Добавляем пост в массив repostedPosts, если его там нет
      if (!userProfile.repostedPosts.includes(new Types.ObjectId(userId))) {
        userProfile.repostedPosts.push(new Types.ObjectId(userId));
        await userProfile.save();
      }

      return sendResponse(res, 200, {
        message: 'Post reposted successfully',
        data: post,
      });
    } catch (error) {
      return sendResponse(res, 500, { message: 'Error adding repost' });
    }
  }
}

export default new PostController();
