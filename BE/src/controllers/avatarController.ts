
import { Request, Response } from 'express';
import UserProfile from '../models/UserProfile';
import { FileCompressor } from '../utils/fileCompressor';
import { FileUploader } from '../utils/fileUplouder';
import { sendResponse } from '../utils/responseUtils';
import { extractPublicId } from '../utils/extractPublicId';
import User from '../models/User';
class AvatarController {
  // Метод загрузки аватара
  public async uploadAvatar(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        return sendResponse(res, 401, { message: 'User is not authorized' });
      }

      if (!req.file) {
        return sendResponse(res, 400, { message: 'No file uploaded' });
      }

      const userId = req.user.id;
      const compressedImage = await FileCompressor.compressImage(
        req.file.buffer
      );
      const avatarUrl = await FileUploader.uploadToCloudinary(
        compressedImage,
        'image'
      );

      if (!avatarUrl) {
        return sendResponse(res, 500, { message: 'Error uploading avatar' });
      }

      const updatedUser = await UserProfile.findOneAndUpdate(
        { user: userId },
        { avatar: avatarUrl },
        { new: true }
      );

      if (!updatedUser) {
        return sendResponse(res, 404, { message: 'Profile not found' });
      }

      return sendResponse(res, 200, {
        message: 'Avatar uploaded successfully',
        data: { avatar: avatarUrl },
      });
    } catch (error) {
      console.error(error);
      return sendResponse(res, 500, { message: 'Error loading avatar' });
    }
  }

  public async getAvatar(req: Request, res: Response): Promise<void> {
    try {
      const { username } = req.params;

      if (!username) {
        return sendResponse(res, 400, { message: 'Username is required' });
      }

      const user = await User.findOne({ username }).select('_id profile');

      if (!user || !user.profile) {
        return sendResponse(res, 404, { message: 'User not found' });
      }

      const userProfile = await UserProfile.findById(user.profile);

      if (!userProfile || !userProfile.avatar) {
        return sendResponse(res, 404, { message: 'Avatar not found' });
      }

      return sendResponse(res, 200, {
        message: 'Avatar retrieved successfully',
        data: { avatar: userProfile.avatar },
      });
    } catch (error) {
      console.error(error);
      sendResponse(res, 500, { message: 'Error getting avatar' });
    }
  }

  // Метод редактирования аватара
  public async editAvatar(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        return sendResponse(res, 401, { message: 'User is not authorized' });
      }

      if (!req.file) {
        return sendResponse(res, 400, { message: 'No file uploaded' });
      }

      const userId = req.user.id;

      
      const compressedImage = await FileCompressor.compressImage(
        req.file.buffer
      );

    
      const avatarUrl = await FileUploader.uploadToCloudinary(
        compressedImage,
        'image'
      );

      if (!avatarUrl) {
        return sendResponse(res, 500, { message: 'Error uploading avatar' });
      }

     
      const user = await User.findOne({ _id: userId }).select('profile');

     
      if (!user || !user.profile) {
        return sendResponse(res, 404, { message: 'User profile not found' });
      }

     
      const updatedProfile = await UserProfile.findByIdAndUpdate(
        user.profile,
        { avatar: avatarUrl },
        { new: true }
      );

      if (!updatedProfile) {
        return sendResponse(res, 404, { message: 'Profile not found' });
      }

      return sendResponse(res, 200, {
        message: 'Avatar updated successfully',
        data: { avatar: avatarUrl },
      });
    } catch (error) {
      console.error(error);
      return sendResponse(res, 500, { message: 'Error updating avatar' });
    }
  }

  // Метод удаления аватара
  //   public async deleteAvatar(req: Request, res: Response): Promise<void> {
  //     try {
  //       if (!req.user) {
  //         return sendResponse(res, 401, { message: 'User is not authorized' });
  //       }

  //       const userId = req.user.id;
  //       const user = await UserProfile.findOne({ user: userId });

  //       if (!user || !user.avatar) {
  //         return sendResponse(res, 404, { message: 'Avatar not found' });
  //       }


  //       const publicId = extractPublicId(user.avatar);
  //       if (publicId) {
  //         await FileUploader.deleteFromCloudinary(publicId);
  //       }


  //       user.avatar = undefined;
  //       await user.save();

  //       return sendResponse(res, 200, { message: 'Avatar deleted successfully' });
  //     } catch (error) {
  //       console.error(error);
  //       return sendResponse(res, 500, { message: 'Error deleting avatar' });
  //     }
  //   }
}

export default new AvatarController();