import { query, queryOne } from '../../config/db';
import type { VitalRow } from '../../types';

export const VitalQueries = {
  findForUser: (userId: string, type?: string, limit = 30) => {
    if (type) {
      return query<VitalRow>(
        `SELECT * FROM vitals WHERE user_id = $1 AND type = $2
         ORDER BY logged_at DESC LIMIT $3`,
        [userId, type, limit]
      );
    }
    return query<VitalRow>(
      `SELECT * FROM vitals WHERE user_id = $1
       ORDER BY logged_at DESC LIMIT $2`,
      [userId, limit]
    );
  },

  findRecent: (userId: string, limit = 5) =>
    query<VitalRow>(
      `SELECT DISTINCT ON (type) * FROM vitals
       WHERE user_id = $1
       ORDER BY type, logged_at DESC
       LIMIT $2`,
      [userId, limit]
    ),

  create: (
    userId: string,
    type: string,
    value: number | null,
    systolic: number | null,
    diastolic: number | null,
    unit: string,
    notes: string | null
  ) =>
    queryOne<VitalRow>(
      `INSERT INTO vitals (user_id, type, value, systolic, diastolic, unit, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [userId, type, value, systolic, diastolic, unit, notes]
    ),

  delete: (id: string, userId: string) =>
    query('DELETE FROM vitals WHERE id = $1 AND user_id = $2', [id, userId]),
};
