-- Migration 001: create the consultations table for the G4 - Consultas module.

-- pgcrypto provides gen_random_uuid() used as the default primary key.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS consultations (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id   VARCHAR(100) NOT NULL,
    slot_id      VARCHAR(100) NOT NULL,
    scheduled_at TIMESTAMPTZ  NOT NULL,
    doctor_name  VARCHAR(150) NOT NULL,
    specialty    VARCHAR(100) NOT NULL,
    status       VARCHAR(30)  NOT NULL DEFAULT 'scheduled',
    notes        TEXT         NULL,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    cancelled_at TIMESTAMPTZ  NULL,
    completed_at TIMESTAMPTZ  NULL,

    -- Only the three known statuses are accepted at the database level.
    CONSTRAINT consultations_status_check
        CHECK (status IN ('scheduled', 'completed', 'cancelled'))
);

-- A slot can only host one consultation: this prevents double booking.
-- Partial unique index: a cancelled consultation frees the slot, so we only
-- enforce uniqueness for non-cancelled rows.
CREATE UNIQUE INDEX IF NOT EXISTS consultations_slot_id_active_unique
    ON consultations (slot_id)
    WHERE status <> 'cancelled';

CREATE INDEX IF NOT EXISTS consultations_patient_id_idx ON consultations (patient_id);
CREATE INDEX IF NOT EXISTS consultations_status_idx ON consultations (status);
CREATE INDEX IF NOT EXISTS consultations_scheduled_at_idx ON consultations (scheduled_at);
