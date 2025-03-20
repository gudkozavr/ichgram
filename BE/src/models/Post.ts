import { Schema, model, Document, Types } from 'mongoose';

export interface IPost extends Document {
  user: Types.ObjectId;
  content: string;
  imageUrls?: string[];
  videoUrl?: string;
  likes: Types.ObjectId[];
  likesCount: number;
  comments: Types.ObjectId[];
  commentsCount: number;
  reposts: Types.ObjectId[];
  repostsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    imageUrls: [{ type: String }],
    videoUrl: { type: String },
    likesCount: { type: Number, default: 0 },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    commentsCount: { type: Number, default: 0 },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    repostsCount: { type: Number, default: 0 },
    reposts: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now }, // Явное указание createdAt
    updatedAt: { type: Date, default: Date.now }, // Явное указание updatedAt
  },
  { timestamps: true } // Опция timestamps все равно остается, чтобы Mongoose автоматически обновлял эти поля.
);

const Post = model<IPost>('Post', postSchema);
export default Post;
