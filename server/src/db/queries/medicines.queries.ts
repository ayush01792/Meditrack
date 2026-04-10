import { query, queryOne } from '../../config/db';
import type { MedicineRow } from '../../types';

export const MedicineQueries = {
  findAll: (userId: string, page: number, limit: number) =>
    query<MedicineRow>(
      `SELECT * FROM medicines WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, (page - 1) * limit]
    ),

  count: async (userId: string): Promise<number> => {
    const rows = await query<{ count: string }>(
      'SELECT COUNT(*) FROM medicines WHERE user_id = $1',
      [userId]
    );
    return parseInt(rows[0].count, 10);
  },

  findById: (id: string, userId: string) =>
    queryOne<MedicineRow>(
      'SELECT * FROM medicines WHERE id = $1 AND user_id = $2',
      [id, userId]
    ),

  findActive: (userId: string) =>
    query<MedicineRow>(
      `SELECT * FROM medicines
       WHERE user_id = $1
         AND is_active = TRUE
         AND start_date <= CURRENT_DATE
         AND (end_date IS NULL OR end_date >= CURRENT_DATE)`,
      [userId]
    ),

  countActive: async (userId: string): Promise<number> => {
    const rows = await query<{ count: string }>(
      `SELECT COUNT(*) FROM medicines
       WHERE user_id = $1 AND is_active = TRUE
         AND start_date <= CURRENT_DATE
         AND (end_date IS NULL OR end_date >= CURRENT_DATE)`,
      [userId]
    );
    return parseInt(rows[0].count, 10);
  },

  create: (
    userId: string,
    name: string,
    dosage: string,
    form: string,
    frequency: string,
    times: string[],
    startDate: string,
    endDate: string | null,
    notes: string | null
  ) =>
    queryOne<MedicineRow>(
      `INSERT INTO medicines
         (user_id, name, dosage, form, frequency, times, start_date, end_date, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [userId, name, dosage, form, frequency, `{${times.join(',')}}`, startDate, endDate, notes]
    ),

  update: (
    id: string,
    userId: string,
    fields: Partial<{
      name: string;
      dosage: string;
      form: string;
      frequency: string;
      times: string[];
      startDate: string;
      endDate: string | null;
      notes: string | null;
    }>
  ) => {
    const sets: string[] = [];
    const values: unknown[] = [];
    let i = 1;

    if (fields.name !== undefined) { sets.push(`name = $${i++}`); values.push(fields.name); }
    if (fields.dosage !== undefined) { sets.push(`dosage = $${i++}`); values.push(fields.dosage); }
    if (fields.form !== undefined) { sets.push(`form = $${i++}`); values.push(fields.form); }
    if (fields.frequency !== undefined) { sets.push(`frequency = $${i++}`); values.push(fields.frequency); }
    if (fields.times !== undefined) { sets.push(`times = $${i++}`); values.push(`{${fields.times.join(',')}}`); }
    if (fields.startDate !== undefined) { sets.push(`start_date = $${i++}`); values.push(fields.startDate); }
    if ('endDate' in fields) { sets.push(`end_date = $${i++}`); values.push(fields.endDate); }
    if ('notes' in fields) { sets.push(`notes = $${i++}`); values.push(fields.notes); }

    values.push(id, userId);
    return queryOne<MedicineRow>(
      `UPDATE medicines SET ${sets.join(', ')} WHERE id = $${i} AND user_id = $${i + 1} RETURNING *`,
      values
    );
  },

  toggleActive: (id: string, userId: string, isActive: boolean) =>
    queryOne<MedicineRow>(
      'UPDATE medicines SET is_active = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [isActive, id, userId]
    ),

  delete: (id: string, userId: string) =>
    query('DELETE FROM medicines WHERE id = $1 AND user_id = $2', [id, userId]),
};
