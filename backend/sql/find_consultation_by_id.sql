-- Fetch a single consultation by its primary key.
SELECT *
FROM consultations
WHERE id = $1;
