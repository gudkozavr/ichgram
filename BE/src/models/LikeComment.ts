import { Schema, model, Document, Types } from "mongoose";

export interface ILike extends Document {
  user: Types.ObjectId;
  post: Types.ObjectId;
}

const likeCommentSchema = new Schema<ILike>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    post: { type: Schema.Types.ObjectId, ref: "Comment", required: true },
  },
  { timestamps: true }
);

const Like = model<ILike>("LikeComment", likeCommentSchema);
export default Like;
