import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticateToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) {
      res.status(401).json({ message: 'Unauthorized' });
      return; // Promise<void> 반환
    }
  
    // jwt.verify를 프로미스로 감싸 처리
    try {
      const decoded = await new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
          if (err) {
            reject(err);
          } else {
            resolve(decoded);
          }
        });
      });
  
      req.body.user_id = (decoded as any).user_id; // decoded 정보를 사용하여 필요한 작업 수행
      next();
    } catch (err) {
      res.status(403).json({ message: 'Invalid token' });
    }
  };