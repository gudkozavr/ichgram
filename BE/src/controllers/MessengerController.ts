import { Socket } from "socket.io";
import User,{IUser} from "../models/User";
import Chat, { IChat } from "../models/Chat";
import Message from "../models/Message";
import { Types } from "mongoose";

interface CustomSocket extends Socket {
 user?:IUser
}
class MessengerController {
  private io: any;
  private users: Map<string, CustomSocket> = new Map(); // Изменено на CustomSocket

  constructor(io: any) {
    this.io = io;
  }

  // Регистрация пользователя в системе
  public connectUser(socket: CustomSocket): void {
    if (!socket.user) {
      socket.emit('error', 'User not authenticated');
      return;
    }

    // Сохраняем пользователя в мапу по его username
    this.users.set(socket.user.username, socket);
    socket.data.username = socket.user.username;

    console.log(`${socket.user.username} подключен.`);
  }

  // Создание чата между двумя пользователями
  public async createChat(socket: CustomSocket, { currentUsername, otherUsername }: { currentUsername: string; otherUsername: string }): Promise<void> {
    try {
      const currentUser = socket.user; // Берем текущего пользователя из сокета
      if (!currentUser) {
        socket.emit("error", "User not authenticated");
        return;
      }

      const otherUser = await User.findOne({ username: otherUsername });
      if (!otherUser) {
        socket.emit("error", "Other user not found");
        return;
      }

      // Создаем или получаем чат
      const chat = await this.createChatBetweenUsers(currentUser._id, otherUser._id);

      // Подключаем пользователей к комнате чата
      socket.join(chat._id.toString());
      const otherUserSocket = this.users.get(otherUser.username);
      if (otherUserSocket) {
        otherUserSocket.join(chat._id.toString());
      }

      // Уведомляем пользователей
      socket.emit("chatCreated", chat);
      if (otherUserSocket) {
        otherUserSocket.emit("chatCreated", chat);
      }

      console.log(`Чат создан между ${currentUsername} и ${otherUsername}`);
    } catch (error) {
      console.error("Error creating chat:", error);
      socket.emit("error", "Error creating chat");
    }
  }

  // Метод для создания или получения существующего чата
  private async createChatBetweenUsers(userId1: Types.ObjectId, userId2: Types.ObjectId): Promise<IChat> {
    const existingChat = await Chat.findOne({
      participants: { $all: [userId1, userId2] },
    });

    if (existingChat) {
      return existingChat;
    }

    const newChat = new Chat({
      participants: [userId1, userId2],
    });

    return await newChat.save();
  }

  // Отправка сообщения
  public async sendMessage(socket: CustomSocket, { chatId, messageContent }: { chatId: string; messageContent: string }): Promise<void> {
    const currentUser = socket.user; // Берем пользователя из сокета

    if (!currentUser) {
      socket.emit("error", "User not authenticated");
      return;
    }

    try {
      const chat = await Chat.findById(chatId);
      if (!chat) {
        socket.emit("error", "Chat not found");
        return;
      }

      const message = new Message({
        content: messageContent,
        sender: currentUser._id,
        receiver: chat.participants.find(p => !p.equals(currentUser._id)),
        chat: chat._id,
      });

      await message.save();

      // Отправляем сообщение всем участникам чата
      this.io.to(chat._id.toString()).emit("newMessage", {
        sender: currentUser.username,
        content: message.content,
        createdAt: message.createdAt,
      });

      console.log(`Новое сообщение от ${currentUser.username}: ${message.content}`);
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("error", "Error sending message");
    }
  }
}

export default MessengerController;