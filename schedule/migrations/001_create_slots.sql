CREATE TABLE IF NOT EXISTS slots (
    id           VARCHAR(100) PRIMARY KEY,
    starts_at    TIMESTAMPTZ  NOT NULL,
    doctor_name  VARCHAR(150) NOT NULL,
    specialty    VARCHAR(100) NOT NULL,
    available    BOOLEAN      NOT NULL DEFAULT true,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS slots_available_idx ON slots (available);
CREATE INDEX IF NOT EXISTS slots_starts_at_idx ON slots (starts_at);
