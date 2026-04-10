import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env';
import { AuthQueries } from '../db/queries/auth.queries';
import { AppError } from '../middleware/errorHandler';
import type { AuthRequest } from '../types';

// ─── Schemas ──────────────────────────────────────────────────────────────────
export const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(6),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
function generateTokens(userId: string, email: string) {
  const accessToken = jwt.sign({ userId, email }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });

  const refreshToken = jwt.sign({ userId, email }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });

  return { accessToken, refreshToken };
}

function getRefreshExpiry(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d;
}

function formatUser(user: { id: string; name: string; email: string; created_at: string }) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.created_at,
  };
}

// ─── Controllers ──────────────────────────────────────────────────────────────
export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, password } = req.body as z.infer<typeof registerSchema>;

    const existing = await AuthQueries.findByEmail(email);
    if (existing) throw new AppError(409, 'Email already registered');

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await AuthQueries.create(name, email, passwordHash);
    if (!user) throw new AppError(500, 'Failed to create user');

    const { accessToken, refreshToken } = generateTokens(user.id, user.email);
    await AuthQueries.saveRefreshToken(user.id, refreshToken, getRefreshExpiry());

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: formatUser(user),
        tokens: { accessToken, refreshToken },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body as z.infer<typeof loginSchema>;

    const user = await AuthQueries.findByEmail(email);
    if (!user) throw new AppError(401, 'Invalid email or password');

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) throw new AppError(401, 'Invalid email or password');

    const { accessToken, refreshToken } = generateTokens(user.id, user.email);
    await AuthQueries.saveRefreshToken(user.id, refreshToken, getRefreshExpiry());

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: formatUser(user),
        tokens: { accessToken, refreshToken },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken } = req.body as { refreshToken: string };
    if (!refreshToken) throw new AppError(400, 'Refresh token required');

    // Verify JWT signature
    let payload: { userId: string; email: string };
    try {
      payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as typeof payload;
    } catch {
      throw new AppError(401, 'Invalid refresh token');
    }

    // Check DB (rotation — invalidate old token)
    const stored = await AuthQueries.findRefreshToken(refreshToken);
    if (!stored) throw new AppError(401, 'Refresh token revoked or expired');

    await AuthQueries.deleteRefreshToken(refreshToken);

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      payload.userId,
      payload.email
    );
    await AuthQueries.saveRefreshToken(payload.userId, newRefreshToken, getRefreshExpiry());

    res.json({
      success: true,
      message: 'Token refreshed',
      data: { accessToken, refreshToken: newRefreshToken },
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken } = req.body as { refreshToken?: string };
    if (refreshToken) {
      await AuthQueries.deleteRefreshToken(refreshToken);
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}

export async function updateFcmToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { fcmToken } = req.body as { fcmToken: string };
    await AuthQueries.updateFcmToken(req.user!.userId, fcmToken);
    res.json({ success: true, message: 'FCM token updated' });
  } catch (err) {
    next(err);
  }
}
