import { PatientsGateway } from './PatientsGateway.js';

// In-memory mock of G1 - Patients, controlled by USE_MOCK_GATEWAYS.
// Lets the module run while the real G1 API is not available locally.
// Any patient id is considered valid EXCEPT a few reserved "not found" ids,
// so manual testing of the happy path is trivial.
const NOT_FOUND_IDS = new Set(['unknown', 'not-found', '00000000-0000-0000-0000-000000000000']);

export class MockPatientsGateway extends PatientsGateway {
  async findPatientById(patientId) {
    if (NOT_FOUND_IDS.has(String(patientId))) return null;
    return {
      idpaciente: patientId,
      nome: `Mock Patient ${patientId}`,
      cpf: '00000000000',
      _mock: true,
    };
  }

  async listPatients() {
    return [
      { idpaciente: 'p1', nome: 'Mock Patient p1', cpf: '11111111111', _mock: true },
      { idpaciente: 'p2', nome: 'Mock Patient p2', cpf: '22222222222', _mock: true },
      { idpaciente: 'p3', nome: 'Mock Patient p3', cpf: '33333333333', _mock: true },
    ];
  }
}
