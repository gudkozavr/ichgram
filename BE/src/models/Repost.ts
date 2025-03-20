import { Schema, model, Document, Types } from 'mongoose';

export interface IRepost extends Document {
  user: Types.ObjectId;
  originalPost: Types.ObjectId;
  content: string; 
}

const repostSchema = new Schema<IRepost>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    originalPost: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    content: { type: String, default: '' },
  },
  { timestamps: true }
);

const Repost = model<IRepost>('Repost', repostSchema);
export default Repost;
