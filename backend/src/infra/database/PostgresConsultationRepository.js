import { ConsultationRepository } from '../../repositories/ConsultationRepository.js';
import { Consultation } from '../../entities/Consultation.js';
import { DatabaseError } from '../../errors/index.js';

// Maps a raw DB row (snake_case) into a Consultation entity (camelCase).
function rowToEntity(row) {
  if (!row) return null;
  return new Consultation({
    id: row.id,
    patientId: row.patient_id,
    slotId: row.slot_id,
    scheduledAt: row.scheduled_at,
    doctorName: row.doctor_name,
    specialty: row.specialty,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    cancelledAt: row.cancelled_at,
    completedAt: row.completed_at,
  });
}

// Concrete implementation of the ConsultationRepository port using raw SQL + pg.
export class PostgresConsultationRepository extends ConsultationRepository {
  constructor(pool) {
    super();
    this.pool = pool;
  }

  async create(consultation) {
    const text = `
      INSERT INTO consultations
        (patient_id, slot_id, scheduled_at, doctor_name, specialty, status, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const values = [
      consultation.patientId,
      consultation.slotId,
      consultation.scheduledAt,
      consultation.doctorName,
      consultation.specialty,
      consultation.status,
      consultation.notes,
    ];
    try {
      const { rows } = await this.pool.query(text, values);
      return rowToEntity(rows[0]);
    } catch (err) {
      // 23505 = unique_violation -> the slot already has an active consultation.
      if (err.code === '23505') {
        throw new DatabaseError('A consultation already exists for this slot.', {
          constraint: err.constraint,
        });
      }
      throw new DatabaseError(err.message);
    }
  }

  async findById(id) {
    const { rows } = await this.pool.query(
      'SELECT * FROM consultations WHERE id = $1',
      [id],
    );
    return rowToEntity(rows[0]);
  }

  async findActiveBySlotId(slotId) {
    const { rows } = await this.pool.query(
      `SELECT * FROM consultations
       WHERE slot_id = $1 AND status <> 'cancelled'
       LIMIT 1`,
      [slotId],
    );
    return rowToEntity(rows[0]);
  }

  async list({ status = null, patientId = null, startDate = null, endDate = null } = {}) {
    const text = `
      SELECT *
      FROM consultations
      WHERE ($1::text IS NULL OR status = $1)
        AND ($2::text IS NULL OR patient_id = $2)
        AND ($3::timestamptz IS NULL OR scheduled_at >= $3)
        AND ($4::timestamptz IS NULL OR scheduled_at <= $4)
      ORDER BY scheduled_at DESC;
    `;
    const { rows } = await this.pool.query(text, [status, patientId, startDate, endDate]);
    return rows.map(rowToEntity);
  }

  async updateStatus(consultation) {
    const text = `
      UPDATE consultations
      SET status = $2, cancelled_at = $3, completed_at = $4, updated_at = NOW()
      WHERE id = $1
      RETURNING *;
    `;
    const values = [
      consultation.id,
      consultation.status,
      consultation.cancelledAt,
      consultation.completedAt,
    ];
    const { rows } = await this.pool.query(text, values);
    return rowToEntity(rows[0]);
  }

  async findPatientHistory(patientId) {
    const text = `
      SELECT *
      FROM consultations
      WHERE patient_id = $1 AND status = 'completed'
      ORDER BY completed_at DESC NULLS LAST, scheduled_at DESC;
    `;
    const { rows } = await this.pool.query(text, [patientId]);
    return rows.map(rowToEntity);
  }
}
