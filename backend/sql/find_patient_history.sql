-- History of completed consultations for a given patient.
-- Used by downstream modules (Prontuário, Faturamento, Exames, Triagem, Autorização).
--   $1 = patient_id
SELECT *
FROM consultations
WHERE patient_id = $1
  AND status = 'completed'
ORDER BY completed_at DESC NULLS LAST, scheduled_at DESC;
