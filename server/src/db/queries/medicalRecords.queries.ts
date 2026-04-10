import { query, queryOne } from '../../config/db';

export interface MedicalRecordRow {
  id: string;
  user_id: string;
  doctor_name: string;
  hospital_name: string;
  visit_date: string;
  diagnosis: string | null;
  notes: string | null;
  prescription_url: string | null;
  created_at: string;
  updated_at: string;
}

export const MedicalRecordQueries = {
  findAll: (userId: string) =>
    query<MedicalRecordRow>(
      `SELECT * FROM medical_records WHERE user_id = $1 ORDER BY visit_date DESC`,
      [userId]
    ),

  findById: (id: string, userId: string) =>
    queryOne<MedicalRecordRow>(
      `SELECT * FROM medical_records WHERE id = $1 AND user_id = $2`,
      [id, userId]
    ),

  create: (
    userId: string,
    doctorName: string,
    hospitalName: string,
    visitDate: string,
    diagnosis: string | null,
    notes: string | null,
    prescriptionUrl: string | null
  ) =>
    queryOne<MedicalRecordRow>(
      `INSERT INTO medical_records
         (user_id, doctor_name, hospital_name, visit_date, diagnosis, notes, prescription_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [userId, doctorName, hospitalName, visitDate, diagnosis, notes, prescriptionUrl]
    ),

  update: (
    id: string,
    userId: string,
    fields: Partial<{
      doctorName: string;
      hospitalName: string;
      visitDate: string;
      diagnosis: string | null;
      notes: string | null;
      prescriptionUrl: string | null;
    }>
  ) => {
    const sets: string[] = [];
    const values: unknown[] = [];
    let i = 1;

    if (fields.doctorName !== undefined) { sets.push(`doctor_name = $${i++}`); values.push(fields.doctorName); }
    if (fields.hospitalName !== undefined) { sets.push(`hospital_name = $${i++}`); values.push(fields.hospitalName); }
    if (fields.visitDate !== undefined) { sets.push(`visit_date = $${i++}`); values.push(fields.visitDate); }
    if ('diagnosis' in fields) { sets.push(`diagnosis = $${i++}`); values.push(fields.diagnosis); }
    if ('notes' in fields) { sets.push(`notes = $${i++}`); values.push(fields.notes); }
    if ('prescriptionUrl' in fields) { sets.push(`prescription_url = $${i++}`); values.push(fields.prescriptionUrl); }

    values.push(id, userId);
    return queryOne<MedicalRecordRow>(
      `UPDATE medical_records SET ${sets.join(', ')} WHERE id = $${i} AND user_id = $${i + 1} RETURNING *`,
      values
    );
  },

  delete: (id: string, userId: string) =>
    query(`DELETE FROM medical_records WHERE id = $1 AND user_id = $2`, [id, userId]),
};
