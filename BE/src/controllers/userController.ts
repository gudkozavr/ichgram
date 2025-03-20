import { Request, Response } from 'express';
import UserProfile from '../models/UserProfile';
import { sendResponse } from '../utils/responseUtils';
import User from '../models/User';
class UserProfileController {
  // Получить профиль текущего пользователя (GET)

  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendResponse(res, 401, { message: 'Unauthorized' });
      }

      const profile = await UserProfile.findOne({ user: userId }).populate(
        'user',
        'username email fullName'
      );
      console.log('jbhhv nv jgv jgv jhvjg', profile);
      if (!profile) {
        return sendResponse(res, 404, { message: 'Profile not found' });
      }

      return sendResponse(res, 200, {
        message: 'Profile found',
        data: profile,
      });
    } catch (error) {
      console.error(error);
      return sendResponse(res, 500, { message: 'Server error' });
    }
  }
  // Получение профиля по username
  static async getProfileByUsername(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { username } = req.params;
      console.log(`Searching for user with username: ${username}`);

      const user = await User.findOne({ username }).select('_id username');
      console.log('User found:', user);

      if (!user) {
        return sendResponse(res, 404, { message: 'User not found' });
      }

      const profile = await UserProfile.findOne({ user: user._id }).populate(
        'user',
        'username email fullName'
      );
      console.log('Profile found:', profile);

      if (profile === null) {
        return sendResponse(res, 200, {
          message: 'Profile not found, returning only user data',
          data: user,
        });
      }

      return sendResponse(res, 200, {
        message: 'Profile found',
        data: profile,
      });
    } catch (error) {
      console.error('Error:', error);
      return sendResponse(res, 500, { message: 'Server error' });
    }
  }
  // Создать новый профиль пользователя (POST)

  static async createProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendResponse(res, 401, { message: 'Unauthorized' });
      }

      const existingProfile = await UserProfile.findOne({ user: userId });
      if (existingProfile) {
        return sendResponse(res, 400, { message: 'Profile already exists' });
      }

      const profile = new UserProfile({ user: userId, ...req.body });
      await profile.save();

      return sendResponse(res, 201, {
        message: 'Profile created successfully',
        data: profile,
      });
    } catch (error) {
      console.error(error);
      return sendResponse(res, 500, { message: 'Server error' });
    }
  }

  //Обновить профиль пользователя (PUT)

  static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendResponse(res, 401, { message: 'Unauthorized' });
      }

      const updatedProfile = await UserProfile.findOneAndUpdate(
        { user: userId },
        { $set: req.body },
        { new: true, runValidators: true }
      );

      if (!updatedProfile) {
        return sendResponse(res, 404, { message: 'Profile not found' });
      }

      return sendResponse(res, 200, {
        message: 'Profile updated successfully',
        data: updatedProfile,
      });
    } catch (error) {
      console.error(error);
      return sendResponse(res, 500, { message: 'Server error' });
    }
  }

  static async searchUsers(req: Request, res: Response): Promise<void> {
    try {
      const { username } = req.body; 

      if (!username || typeof username !== 'string') {
        res.status(400).json({ message: 'Введите часть имени для поиска' });
        return;
      }

      const users = await User.find({
        username: { $regex: username, $options: 'i' }, 
      }).select('username');

      res.status(200).json(users); 
    } catch (error) {
      console.error('Ошибка поиска пользователей:', error);
      res.status(500).json({ message: 'Ошибка сервера, попробуйте позже' });
    }
  }
}

export default UserProfileController;
