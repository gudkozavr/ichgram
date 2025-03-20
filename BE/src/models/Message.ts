import { Schema, model, Document, Types } from 'mongoose';


interface IMessage extends Document {
  _id:Types.ObjectId
  content: string; 
  sender: Types.ObjectId; 
  receiver: Types.ObjectId; 
  chat: Types.ObjectId; 
  createdAt: Date; 
  read: boolean; 
}


const messageSchema = new Schema<IMessage>({
  content: {
    type: String,
    required: true,
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiver: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  chat: {
    type: Schema.Types.ObjectId,
    ref: 'Chat',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  read: {
    type: Boolean,
    default: false,
  },
});

const Message = model<IMessage>('Message', messageSchema);

export default Message;
