import { Schema, model, Document, Types } from 'mongoose';

export interface IComment extends Document {
  user: Types.ObjectId;
  post: Types.ObjectId;
  content: string;
  likes: Types.ObjectId[];
  likesCount: number;
  replies: Types.ObjectId[]; //  ответ на комментарий
  repliesCount: number; // количества ответов
}

const commentSchema = new Schema<IComment>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    content: { type: String, required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }], // масив id
    likesCount: { type: Number, default: 0 },
    replies: [{ type: Schema.Types.ObjectId, ref: 'Comment' }], 
    repliesCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Comment = model<IComment>('Comment', commentSchema);
export default Comment;
