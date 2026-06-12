-- Insert a new consultation. Status defaults to 'scheduled'.
INSERT INTO consultations
    (patient_id, slot_id, scheduled_at, doctor_name, specialty, status, notes)
VALUES
    ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;
