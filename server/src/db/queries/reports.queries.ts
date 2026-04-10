import { query, queryOne } from '../../config/db';
import type { ShareTokenRow } from '../../types';

export const ReportQueries = {
  createShareToken: (userId: string, token: string, expiresAt: Date) =>
    queryOne<ShareTokenRow>(
      `INSERT INTO share_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3) RETURNING *`,
      [userId, token, expiresAt]
    ),

  findShareToken: (token: string) =>
    queryOne<ShareTokenRow>(
      `SELECT * FROM share_tokens WHERE token = $1 AND expires_at > NOW()`,
      [token]
    ),

  deleteShareTokensForUser: (userId: string) =>
    query('DELETE FROM share_tokens WHERE user_id = $1', [userId]),
};
