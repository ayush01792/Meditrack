import { query, queryOne } from '../../config/db';
import type { UserRow, RefreshTokenRow } from '../../types';

export const AuthQueries = {
  findByEmail: (email: string) =>
    queryOne<UserRow>('SELECT * FROM users WHERE email = $1', [email]),

  findById: (id: string) =>
    queryOne<UserRow>('SELECT * FROM users WHERE id = $1', [id]),

  create: (name: string, email: string, passwordHash: string) =>
    queryOne<UserRow>(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3) RETURNING *`,
      [name, email, passwordHash]
    ),

  updateFcmToken: (userId: string, fcmToken: string) =>
    query('UPDATE users SET fcm_token = $1 WHERE id = $2', [fcmToken, userId]),

  saveRefreshToken: (userId: string, token: string, expiresAt: Date) =>
    query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [userId, token, expiresAt]
    ),

  findRefreshToken: (token: string) =>
    queryOne<RefreshTokenRow>(
      `SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()`,
      [token]
    ),

  deleteRefreshToken: (token: string) =>
    query('DELETE FROM refresh_tokens WHERE token = $1', [token]),

  deleteAllRefreshTokens: (userId: string) =>
    query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]),

  // Clean up expired tokens (called by cron)
  purgeExpiredTokens: () =>
    query('DELETE FROM refresh_tokens WHERE expires_at < NOW()'),
};
