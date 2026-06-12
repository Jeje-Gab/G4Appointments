import dotenv from 'dotenv';

dotenv.config();

function bool(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

function int(value, fallback) {
  const n = Number.parseInt(value, 10);
  return Number.isNaN(n) ? fallback : n;
}

export const env = {
  port: int(process.env.PORT, 3000),

  database: {
    // If DATABASE_URL is provided it takes precedence over the discrete vars.
    connectionString: process.env.DATABASE_URL || undefined,
    host: process.env.PGHOST || 'localhost',
    port: int(process.env.PGPORT, 5432),
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    database: process.env.PGDATABASE || 'g4_consultations',
  },

  external: {
    patientsBaseUrl: process.env.PATIENTS_API_BASE_URL || 'http://localhost:3001',
    scheduleBaseUrl: process.env.SCHEDULE_API_BASE_URL || 'http://localhost:3002',
    httpTimeoutMs: int(process.env.EXTERNAL_HTTP_TIMEOUT_MS, 5000),
  },

  useMockGateways: bool(process.env.USE_MOCK_GATEWAYS, false),

  auth: {
    // Lifetime of a login session token, in hours.
    sessionTtlHours: int(process.env.SESSION_TTL_HOURS, 12),
  },
};
