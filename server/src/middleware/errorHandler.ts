import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }

  if (err instanceof ZodError) {
    const issues = err.issues ?? [];
    const message = issues.map((e) => `${e.path.map(String).join('.')}: ${e.message}`).join(', ');
    res.status(400).json({ success: false, message });
    return;
  }

  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
}

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ success: false, message: 'Route not found' });
}
