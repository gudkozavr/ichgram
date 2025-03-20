import { Schema, model, Document, Types } from 'mongoose';

export interface IResetToken extends Document {
  email: string;
  token: string;
  expiresAt: Date;
}

const resetTokenSchema = new Schema<IResetToken>({
  email: { type: String, required: true },
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

const ResetToken = model<IResetToken>('ResetToken', resetTokenSchema);
export default ResetToken;
