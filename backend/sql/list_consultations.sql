-- List consultations with optional filters. Any of the parameters may be NULL,
-- in which case the corresponding filter is ignored.
--   $1 = status        (text, nullable)
--   $2 = patient_id    (text, nullable)
--   $3 = start_date    (timestamptz, nullable) -> scheduled_at >= $3
--   $4 = end_date      (timestamptz, nullable) -> scheduled_at <= $4
SELECT *
FROM consultations
WHERE ($1::text IS NULL OR status = $1)
  AND ($2::text IS NULL OR patient_id = $2)
  AND ($3::timestamptz IS NULL OR scheduled_at >= $3)
  AND ($4::timestamptz IS NULL OR scheduled_at <= $4)
ORDER BY scheduled_at DESC;
