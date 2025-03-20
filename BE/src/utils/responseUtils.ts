import { Response } from 'express';
interface IResponseData<T> {
  message: string;
  data?: T;
  token?: string;
}

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  { message, data, token }: IResponseData<T>
) => {
  res.status(statusCode).json({
    message,
    ...(data && { data }),
    ...(token && { token }), 
  });
};