import User from '../models/User';
import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { sendResponse } from '../utils/responseUtils';
import JwtService from '../utils/jwt';
import UserProfile from '../models/UserProfile';
import { Types } from 'mongoose';
class AuthController {
  // static async register(req: Request, res: Response): Promise<void> {
  //   try {
  //     const { username, email, fullName, password } = req.body;

  //     if (!username || !email || !fullName || !password) {
  //       return sendResponse(res, 400, { message: 'All fields are required' });
  //     }

  //     // Валидация email
  //     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //     if (!emailRegex.test(email)) {
  //       return sendResponse(res, 400, { message: 'Invalid email format' });
  //     }

  //     // Валидация пароля (длина, цифры, заглавные буквы и спецсимволы)
  //     const passwordRegex = /^[A-Za-z\d@$!%*?&]{8,12}$/;
  //     if (!passwordRegex.test(password)) {
  //       return sendResponse(res, 400, {
  //         message:
  //           'Password must be at least 8 characters long, include uppercase letters, lowercase letters, numbers, and special characters',
  //       });
  //     }

  //     // Валидация полного имени (допустимы только буквы и пробелы)
  //     const fullNameRegex = /^[a-zA-Zа-яА-ЯёЁ\s]+$/;
  //     if (!fullNameRegex.test(fullName)) {
  //       return sendResponse(res, 400, {
  //         message: 'Full name must contain only letters and spaces',
  //       });
  //     }

  //     const existingUser = await User.findOne({
  //       $or: [{ username }, { email }],
  //     });
  //     if (existingUser) {
  //       return sendResponse(res, 400, {
  //         message: 'User with this username or email already exists',
  //       });
  //     }

  //     const hashedPassword = await bcrypt.hash(password, 10);

  //     const newUser = new User({
  //       username,
  //       email,
  //       fullName,
  //       passwormaled: hashedPassword,
  //     });

  //     // Создание профиля для нового пользователя
  //     // const newUserProfile = new UserProfile({
  //     //   user: newUser._id,
  //     //   bio: 'none',
  //     //   gender: 'other',
  //     //   address: {
  //     //     city: '', // или значение по умолчанию
  //     //     state: '', // или значение по умолчанию
  //     //     country: '', // или значение по умолчанию
  //     //   },
  //     //   interests: [],
  //     //   occupation: '',
  //     //   education: '',
  //     //   followersCount: 0,
  //     //   followingCount: 0,
  //     //   repostedPosts: [],
  //     // });

  //     // Сохранение профиля пользователя
  //     // await newUserProfile.save();

  //     // Привязка профиля к пользователю
  //     // newUser.profile = newUserProfile._id as Types.ObjectId;

  //     // Сохранение пользователя с привязанным профилем
  //     await newUser.save();

  //     return sendResponse(res, 201, {
  //       message: 'User registered successfully',
  //       data: {
  //         username: newUser.username,
  //         email: newUser.email,
  //         fullName: newUser.fullName,
  //         // profile: newUserProfile,
  //       },
  //     });
  //   } catch (error) {
  //     console.error(error);
  //     return sendResponse(res, 500, { message: 'Server error' });
  //   }
  // }
  static async register(req: Request, res: Response): Promise<void> {
  try {
    const { username, email, fullName, password } = req.body;

    if (!username  ||!email || !fullName || !password) {
      return sendResponse(res, 400, { message: 'All fields are required' });
    }

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendResponse(res, 400, { message: 'Invalid email format' });
    }

    // Валидация пароля (длина, цифры, заглавные буквы и спецсимволы)
    const passwordRegex = /^[A-Za-z\d@$!%*?&]{8,12}$/;
    if (!passwordRegex.test(password)) {
      return sendResponse(res, 400, {
        message:
          'Password must be at least 8 characters long, include uppercase letters, lowercase letters, numbers, and special characters',
      });
    }

    // Валидация полного имени (допустимы только буквы и пробелы)
    const fullNameRegex = /^[a-zA-Zа-яА-ЯёЁ\s]+$/;
    if (!fullNameRegex.test(fullName)) {
      return sendResponse(res, 400, {
        message: 'Full name must contain only letters and spaces',
      });
    }

    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });
    if (existingUser) {
      return sendResponse(res, 400, {
        message: 'User with this username or email already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      fullName,
      password: hashedPassword, // Исправление: исправленное имя поля
      mustChangePassword: false,
      role: 'user',
      profile: null, // Изначально профиль еще не создан, его нужно будет привязать позднее
    });

    // Создание профиля для нового пользователя
    const newUserProfile = new UserProfile({
      user: newUser._id,
      bio: 'none',
      gender: 'other',
      address: {
        city: '', // или значение по умолчанию
        state: '', // или значение по умолчанию
        country: '', // или значение по умолчанию
      },
      interests: [],
      occupation: '',
      education: '',
      followersCount: 0,
      followingCount: 0,
      repostedPosts: [],
    });

    // Сохранение профиля пользователя
    await newUserProfile.save();

    // Привязка профиля к пользователю
    newUser.profile = newUserProfile._id as Types.ObjectId;

    // Сохранение пользователя с привязанным профилем
    await newUser.save();

    return sendResponse(res, 201, {
      message: 'User registered successfully',
      data: {
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
        profile: newUserProfile,
      },
    });
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, { message: 'Server error' });
  }
}
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { emailOrUsername, password } = req.body; // Используйте emailOrUsername, чтобы принимать одно из полей

      if (!emailOrUsername || !password) {
        return sendResponse(res, 400, {
          message: 'Both email/username and password are required',
        });
      }

      // Проверяем, является ли emailOrUsername email'ом или username
      const user = await User.findOne({
        $or: [{ username: emailOrUsername }, { email: emailOrUsername }],
      });

      if (!user) {
        return sendResponse(res, 400, { message: 'Invalid credentials' });
      }

      // Генерация токена
      const token = JwtService.generateToken({
        id: user._id,
        username: user.username,
        role: user.role,
      });

      return sendResponse(res, 200, {
        message: 'Login successful',
        token,
        data: {
          id: user._id,
          username: user.username,
        },
      });
    } catch (error) {
      console.error(error);
      return sendResponse(res, 500, { message: 'Server error' });
    }
  }
}

export default AuthController;
