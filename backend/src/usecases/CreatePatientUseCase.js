import { ValidationError } from '../errors/index.js';

const REQUIRED = ['nome', 'telefone', 'cpf', 'data_nascimento', 'endereco'];

export class CreatePatientUseCase {
  constructor({ patientsGateway }) {
    this.patientsGateway = patientsGateway;
  }

  async execute(data) {
    const missing = REQUIRED.filter((f) => !data[f]?.toString().trim());
    if (missing.length) {
      throw new ValidationError('Campos obrigatórios ausentes.', missing.map((f) => `${f} é obrigatório.`));
    }
    return this.patientsGateway.createPatient(data);
  }
}
