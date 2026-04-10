import type { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from './errorHandler';
import type { AuthPayload, AuthRequest } from '../types';

export function authenticate(req: AuthRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError(401, 'No token provided'));
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthPayload;
    req.user = payload;
    next();
  } catch {
    next(new AppError(401, 'Invalid or expired token'));
  }
}
