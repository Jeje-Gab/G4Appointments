import { env } from './config/env.js';
import { pool } from './infra/database/pool.js';
import { createApp } from './infra/http/app.js';

// Infra implementations
import { PostgresConsultationRepository } from './infra/database/PostgresConsultationRepository.js';
import { PostgresApiClientRepository } from './infra/database/PostgresApiClientRepository.js';
import { PostgresUserRepository } from './infra/database/PostgresUserRepository.js';
import { HttpClient } from './infra/external/http/HttpClient.js';
import { HttpPatientsGateway } from './infra/external/patients/HttpPatientsGateway.js';
import { MockPatientsGateway } from './infra/external/patients/MockPatientsGateway.js';
import { HttpScheduleGateway } from './infra/external/schedule/HttpScheduleGateway.js';
import { MockScheduleGateway } from './infra/external/schedule/MockScheduleGateway.js';

// Use cases — consultations
import { CreateConsultationUseCase } from './usecases/CreateConsultationUseCase.js';
import { UpdateConsultationStatusUseCase } from './usecases/UpdateConsultationStatusUseCase.js';
import { CancelConsultationUseCase } from './usecases/CancelConsultationUseCase.js';
import { GetConsultationByIdUseCase } from './usecases/GetConsultationByIdUseCase.js';
import { ListConsultationsUseCase } from './usecases/ListConsultationsUseCase.js';
import { GetPatientConsultationHistoryUseCase } from './usecases/GetPatientConsultationHistoryUseCase.js';

// Use cases — patients (G1 proxy)
import { ListPatientsUseCase } from './usecases/ListPatientsUseCase.js';

// Use cases — auth / admin
import { AuthenticateApiKeyUseCase } from './usecases/AuthenticateApiKeyUseCase.js';
import { CreateApiClientUseCase } from './usecases/CreateApiClientUseCase.js';
import { ListApiClientsUseCase } from './usecases/ListApiClientsUseCase.js';
import { RevokeApiClientUseCase } from './usecases/RevokeApiClientUseCase.js';
import { LoginUseCase } from './usecases/LoginUseCase.js';
import { AuthenticateSessionUseCase } from './usecases/AuthenticateSessionUseCase.js';
import { LogoutUseCase } from './usecases/LogoutUseCase.js';
import { ListUsersUseCase } from './usecases/ListUsersUseCase.js';
import { CreateUserUseCase } from './usecases/CreateUserUseCase.js';
import { ChangeUserPasswordUseCase } from './usecases/ChangeUserPasswordUseCase.js';

import { ConsultationHandler } from './handlers/ConsultationHandler.js';
import { AuthHandler } from './handlers/AuthHandler.js';
import { AdminHandler } from './handlers/AdminHandler.js';
import { PatientsHandler } from './handlers/PatientsHandler.js';

// ----- Composition root: wire concrete dependencies into the use cases -----

function buildGateways() {
  if (env.useMockGateways) {
    // eslint-disable-next-line no-console
    console.log('[gateways] USE_MOCK_GATEWAYS=true -> using in-memory mock gateways');
    return {
      patientsGateway: new MockPatientsGateway(),
      scheduleGateway: new MockScheduleGateway(),
    };
  }
  const patientsHttp = new HttpClient({
    baseURL: env.external.patientsBaseUrl,
    timeout: env.external.httpTimeoutMs,
    headers: env.external.patientsToken
      ? { Authorization: `Bearer ${env.external.patientsToken}` }
      : {},
  });
  const scheduleHttp = new HttpClient({
    baseURL: env.external.scheduleBaseUrl,
    timeout: env.external.httpTimeoutMs,
  });
  return {
    patientsGateway: new HttpPatientsGateway(patientsHttp),
    scheduleGateway: new HttpScheduleGateway(scheduleHttp),
  };
}

function buildDependencies() {
  // Repositories
  const consultationRepository = new PostgresConsultationRepository(pool);
  const apiClientRepository = new PostgresApiClientRepository(pool);
  const userRepository = new PostgresUserRepository(pool);

  const { patientsGateway, scheduleGateway } = buildGateways();

  // Consultation use cases + handler
  const consultationUseCases = {
    createConsultation: new CreateConsultationUseCase({
      consultationRepository,
      patientsGateway,
      scheduleGateway,
    }),
    updateConsultationStatus: new UpdateConsultationStatusUseCase({
      consultationRepository,
      scheduleGateway,
    }),
    cancelConsultation: new CancelConsultationUseCase({
      consultationRepository,
      scheduleGateway,
    }),
    getConsultationById: new GetConsultationByIdUseCase({ consultationRepository }),
    listConsultations: new ListConsultationsUseCase({ consultationRepository }),
    getPatientHistory: new GetPatientConsultationHistoryUseCase({ consultationRepository }),
  };
  const consultationHandler = new ConsultationHandler(consultationUseCases);

  const patientsHandler = new PatientsHandler({
    listPatients: new ListPatientsUseCase({ patientsGateway }),
  });

  // Auth use cases (used by middlewares + auth handler)
  const authenticateApiKeyUseCase = new AuthenticateApiKeyUseCase({ apiClientRepository });
  const authenticateSessionUseCase = new AuthenticateSessionUseCase({ userRepository });

  const authHandler = new AuthHandler({
    login: new LoginUseCase({ userRepository, sessionTtlHours: env.auth.sessionTtlHours }),
    logout: new LogoutUseCase({ userRepository }),
  });

  // Admin use cases + handler (API key + user management, admin role only)
  const adminHandler = new AdminHandler({
    listApiClients: new ListApiClientsUseCase({ apiClientRepository }),
    createApiClient: new CreateApiClientUseCase({ apiClientRepository }),
    revokeApiClient: new RevokeApiClientUseCase({ apiClientRepository }),
    listUsers: new ListUsersUseCase({ userRepository }),
    createUser: new CreateUserUseCase({ userRepository }),
    changeUserPassword: new ChangeUserPasswordUseCase({ userRepository }),
  });

  return {
    consultationHandler,
    patientsHandler,
    authHandler,
    adminHandler,
    authenticateApiKeyUseCase,
    authenticateSessionUseCase,
  };
}

const app = createApp(buildDependencies());

const server = app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`[server] G4 - Consultas API listening on http://localhost:${env.port}`);
  // eslint-disable-next-line no-console
  console.log('[server] auth: /api/auth/*  | internal: /api/* (session)  | admin: /api/admin/* (role admin)  | external: /external/v1/* (api key)');
});

// Graceful shutdown.
function shutdown(signal) {
  // eslint-disable-next-line no-console
  console.log(`\n[server] ${signal} received, shutting down...`);
  server.close(async () => {
    await pool.end().catch(() => {});
    process.exit(0);
  });
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
