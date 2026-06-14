import { PatientsGateway } from './PatientsGateway.js';

// In-memory mock of G1 - Patients, controlled by USE_MOCK_GATEWAYS.
// Lets the module run while the real G1 API is not available locally.
// Any patient id is considered valid EXCEPT a few reserved "not found" ids,
// so manual testing of the happy path is trivial.
const NOT_FOUND_IDS = new Set(['unknown', 'not-found', '00000000-0000-0000-0000-000000000000']);

export class MockPatientsGateway extends PatientsGateway {
  constructor() {
    super();
    this._patients = [
      { idpaciente: 1, nome: 'Mock Patient p1', cpf: '11111111111', telefone: '11000000001', data_nascimento: '1990-01-01', endereco: 'Rua Mock, 1', foto: null },
      { idpaciente: 2, nome: 'Mock Patient p2', cpf: '22222222222', telefone: '11000000002', data_nascimento: '1985-06-15', endereco: 'Rua Mock, 2', foto: null },
      { idpaciente: 3, nome: 'Mock Patient p3', cpf: '33333333333', telefone: '11000000003', data_nascimento: '2000-12-31', endereco: 'Rua Mock, 3', foto: null },
    ];
    this._nextId = 4;
  }

  async findPatientById(patientId) {
    if (NOT_FOUND_IDS.has(String(patientId))) return null;
    return this._patients.find((p) => String(p.idpaciente) === String(patientId)) ?? null;
  }

  async listPatients() {
    return [...this._patients];
  }

  async createPatient(data) {
    const patient = { idpaciente: this._nextId++, ...data, foto: data.foto ?? null };
    this._patients.push(patient);
    return patient;
  }
}
