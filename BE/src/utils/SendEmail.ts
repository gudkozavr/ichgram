import nodemailer from 'nodemailer';
import 'dotenv/config'
export interface IEmailOptions {
  to: string;
  subject: string;
  text: string;
}
const email = process.env.EMAIL_USER || 'user email';
const pass = process.env.PASS_USER || 'user pass';

export const sendEmail = async ({ to, subject, text }: IEmailOptions, p0: string, p1: string) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: email,
      pass: pass,
    },
  });
  await transporter.sendMail({
    from: email,
    to,
    subject,
    text,
  });
};

export default sendEmail;
