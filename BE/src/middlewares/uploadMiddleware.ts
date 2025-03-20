import multer, { FileFilterCallback } from "multer";
import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; username: string; role: string };
    }
  }
}

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter: async (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) => {
    try {
      // console.log(req.user)

      if (!req.user) {
        return cb(new Error("User is not authorized"));
      }

      const allowedTypes = /jpeg|jpg|png|gif|mp4/;
      const isValidExtname = allowedTypes.test(file.originalname.toLowerCase());
      const isValidMimeType = allowedTypes.test(file.mimetype);

      if (isValidExtname && isValidMimeType) {
        return cb(null, true);
      } else {
        return cb(
          new Error("Invalid file type. Only images and videos are allowed.")
        );
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        return cb(error);
      } else {
        return cb(new Error("Unknown error occurred"));
      }
    }
  },
});

export default upload;
