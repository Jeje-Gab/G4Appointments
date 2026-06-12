-- Update the status of a consultation and the related timestamps.
--   $1 = id
--   $2 = status        ('scheduled' | 'completed' | 'cancelled')
--   $3 = cancelled_at  (timestamptz, nullable)
--   $4 = completed_at  (timestamptz, nullable)
UPDATE consultations
SET status       = $2,
    cancelled_at = $3,
    completed_at = $4,
    updated_at   = NOW()
WHERE id = $1
RETURNING *;
