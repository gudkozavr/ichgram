// controllers/ChatController.ts
import { Request, Response } from 'express';
import Chat from '../models/Chat';
import Message from '../models/Message';
import User from '../models/User';

class ChatController {
   public async createChat(req: Request, res: Response): Promise<void> {
    const { username1, username2 } = req.body;

    try {
      const user1 = await User.findOne({ username: username1 });
      const user2 = await User.findOne({ username: username2 });

      if (!user1 || !user2) {
         res.status(404).json({ message: 'One or both users not found' });
     return }

      const chat = new Chat({
        participants: [user1._id, user2._id],
        chatName: `${username1} & ${username2}`,
      });

      await chat.save();
       res.status(201).json(chat);
    } catch (error) {
       res.status(500).json({ message: 'Error creating chat', error });
    }
  }

   public async sendMessage(req: Request, res: Response): Promise<void> {
    

     try {
       const { chatId, senderUsername, receiverUsername, content } = req.body;
       console.log(senderUsername, receiverUsername);
       const sender = await User.findOne({ username: senderUsername });
       
      const receiver = await User.findOne({ username: receiverUsername });
      
      if (!sender || !receiver) {
        res.status(404).json({ message: 'Sender or receiver not found' });
      return }

      const chat = await Chat.findById(chatId);
      if (!chat) {
         res.status(404).json({ message: 'Chat not found' });
      return}

      const message = new Message({
        content,
        sender: sender._id,
        receiver: receiver._id,
        chat: chat._id,
        createdAt: new Date(),
        read: false,
      });

      await message.save();

      chat.lastMessage = message._id;
      await chat.save();

       res.status(201).json(message);
    } catch (error) {
       res.status(500).json({ message: 'Error sending message', error });
    }
  }

  public async getMessages(req: Request, res: Response): Promise<void> {
    const { chatId } = req.params;

    try {
      const messages = await Message.find({ chat: chatId }).populate('sender receiver');
      res.status(200).json(messages);
    } catch (error) {
       res.status(500).json({ message: 'Error fetching messages', error });
    }
  }
}

export default new ChatController();