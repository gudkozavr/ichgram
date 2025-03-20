import jwt, { JwtPayload } from 'jsonwebtoken';
import { Socket } from 'socket.io';
import User, { IUser } from '../models/User'; // Предполагается, что IUser — это интерфейс вашей модели User.

interface ISocketWithUser extends Socket {
  user?: IUser; // Добавляем типизированное поле user в объект socket.
}

const authenticateSocket = async (
  socket: ISocketWithUser,
  next: (err?: Error) => void
): Promise<void> => {
  const token = socket.handshake.headers.authorization;

  if (!token) {
    return next(new Error("Access denied! Token wasn't provided"));
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'secret'
    ) as JwtPayload & { user_id: string };
    const user = await User.findById(decoded.user_id);

    if (!user) {
      return next(new Error('User is not found'));
    }

    socket.user = user; // Присваиваем найденного пользователя в socket.user.

    next();
  } catch (error) {
    return next(new Error('Token is not valid'));
  }
};

export default authenticateSocket;
