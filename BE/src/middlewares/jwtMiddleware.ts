import { Request, Response, NextFunction } from 'express';
import JwtService from '../utils/jwt';
import { sendResponse } from '../utils/responseUtils';
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; username: string; role: string }; 
    }
  }
}

const jwtMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return sendResponse(res, 401, {
        message: 'Authorization token is missing',
      });
    }

    const decoded = await JwtService.verifyToken(token);
    
    if (!decoded  || typeof decoded !== 'object' || !('id' in decoded) || !('username' in decoded)) {
     return sendResponse(res, 401, {
       message: 'Invalid token structure',
     });
    }

 
    req.user = {
      id: String(decoded.id),
      username: String(decoded.username),
      role: String(decoded.role), 
    };

    next(); 
  } catch (error) {
     console.error(error);
     return sendResponse(res, 500, { message: 'Server error' });
  }
};

export default jwtMiddleware;