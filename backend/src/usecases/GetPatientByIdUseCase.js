import { PatientNotFoundError } from '../errors/index.js';

export class GetPatientByIdUseCase {
  constructor({ patientsGateway }) {
    this.patientsGateway = patientsGateway;
  }

  async execute(patientId) {
    const patient = await this.patientsGateway.findPatientById(patientId);
    if (!patient) throw new PatientNotFoundError(`Patient "${patientId}" was not found.`);
    return patient;
  }
}
