import { NextFunction, Request, Response } from 'express';
import { ErrorDTO } from './errorDTO/errorDTO';


export class CustomError extends Error {
    statusCode: number;
  
    code: number;
  
    description: string;
  
    path?: string;
  
    constructor(error: Omit<ErrorDTO, 'path'>, existingError: Error) {
      super(error.description);
  
      this.statusCode = error.statusCode;
      this.code = error.code;
      this.description = error.description;
  
      // 기존 에러 객체의 스택 사용
      this.stack = existingError.stack;
  
      // 스택 추적에서 CustomError 생성자 제외
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, CustomError);
      }
  
      this.path = this.extractErrorPath();
  
      Object.setPrototypeOf(this, CustomError.prototype);
    }
  
    private extractErrorPath(): string {
      if (!this.stack) {
        return 'Unknown location';
      }
  
      const stackLines = this.stack.split('\n');
      const relevantLine = stackLines.find((line) => line.includes('at'));
      if (!relevantLine) return 'Unknown location';
  
      const match = relevantLine.match(/\((.*):\d+:\d+\)/);
      return match ? match[1] : 'Unknown location';
    }
  }

export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction
  ) {
    if (err instanceof CustomError) {
      res.status(err.statusCode).json({
        code: err.code,
        description: err.description,
        path: err.path,
      });
    } else {
      res.status(500).json({
        code: 500,
        description: 'Internal Server Error',
        path: req.path,
      });
    }
  }