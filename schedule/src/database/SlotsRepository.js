function toSlot(row) {
  return {
    id: row.id,
    startsAt: row.starts_at,
    doctorName: row.doctor_name,
    specialty: row.specialty,
    available: row.available,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SlotsRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async list({ available } = {}) {
    const conditions = [];
    const values = [];
    if (available !== undefined) {
      conditions.push(`available = $${values.length + 1}`);
      values.push(available);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const { rows } = await this.pool.query(
      `SELECT * FROM slots ${where} ORDER BY starts_at ASC`,
      values,
    );
    return rows.map(toSlot);
  }

  async findById(id) {
    const { rows } = await this.pool.query('SELECT * FROM slots WHERE id = $1', [id]);
    return rows[0] ? toSlot(rows[0]) : null;
  }

  async create({ id, startsAt, doctorName, specialty }) {
    const { rows } = await this.pool.query(
      `INSERT INTO slots (id, starts_at, doctor_name, specialty)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id, startsAt, doctorName, specialty],
    );
    return toSlot(rows[0]);
  }

  async setAvailable(id, available) {
    const { rows } = await this.pool.query(
      `UPDATE slots SET available = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [available, id],
    );
    return rows[0] ? toSlot(rows[0]) : null;
  }
}
