import { Schema, model, Document, Types } from 'mongoose';

export interface IChat extends Document {
  _id: Types.ObjectId;
  participants: Types.ObjectId[];
  chatName: string;
  createdAt: Date;
  lastMessage: Types.ObjectId | null;
  isActive: boolean;
}

const chatSchema = new Schema<IChat>({
  participants: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  ],
  chatName: {
    type: String,
    default: function (this: IChat) {
      return this.participants.map((p) => p.toString()).join(' & '); // Формируем имя чата на основе участников
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastMessage: {
    type: Schema.Types.ObjectId,
    ref: 'Message',
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const Chat = model<IChat>('Chat', chatSchema);
export default Chat;
