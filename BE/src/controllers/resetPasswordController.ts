import { Request, Response } from 'express';
import JwtService from '../utils/jwt';
import ResetToken from '../models/ResetToken';
import User from '../models/User';
import { sendResponse } from '../utils/responseUtils';
import sendEmail from '../utils/sendEmail';

import bcrypt from 'bcryptjs';

class PasswordResetController {
  // Запрос на сброс пароля
  public async requestPasswordReset(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return sendResponse(res, 400, { message: 'Email not found' });
      }

      // Генерация JWT токена (действителен 15 мин)
      const token = JwtService.generateToken({ email } );

      // Сохранение токена в базе
      await ResetToken.create({
        email,
        token,
        expiresAt: new Date(Date.now() + 3600000),
      });

      // Отправка письма со ссылкой
      const resetLink = `http://localhost:5173/reset-password?token=${token}`;
      await sendEmail(
        {
          to: email,
          subject: 'Password Reset',
          text: `Click here to reset your password: ${resetLink} `,
        },
        'p0',
        'p1'
      );

      return sendResponse(res, 200, {
        message: 'Reset link sent to email',
      });
    } catch (error) {
      console.error(error);
      return sendResponse(res, 500, { message: 'Server error' });
    }
  }

  // Обновление пароля
  public async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, newPassword } = req.body;

      const decoded = JwtService.verifyToken(token);
      if (!decoded || !decoded.email) {
        return sendResponse(res, 400, { message: 'Invalid or expired token' });
      }

      const user = await User.findOne({ email: decoded.email });
      if (!user) {
        return sendResponse(res, 400, { message: 'User not found' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      // Удаляем использованный токен
      await ResetToken.deleteOne({ token });

      return sendResponse(res, 200, { message: 'Password successfully reset' });
    } catch (error) {
      console.error(error);
      return sendResponse(res, 500, { message: 'Server error' });
    }
  }
}

export default new PasswordResetController();
