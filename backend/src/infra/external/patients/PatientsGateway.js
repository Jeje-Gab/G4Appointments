/* eslint-disable no-unused-vars */
// Contract (port) for the G1 - Patients module.
export class PatientsGateway {
  // Return the patient object for the given id, or null when not found.
  async findPatientById(patientId) {
    throw new Error('PatientsGateway.findPatientById not implemented');
  }

  // Return all patients as an array (empty array when none found).
  async listPatients() {
    throw new Error('PatientsGateway.listPatients not implemented');
  }
}
