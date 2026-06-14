import { PatientsGateway } from './PatientsGateway.js';
import { ExternalServiceError } from '../../../errors/index.js';

// Real HTTP implementation of the G1 - Patients gateway.
// Expects: GET {baseURL}/paciente/:id  -> 200 G1Patient | 404 { message }
// Shape of G1Patient is documented in G1PatientSchema.js.
export class HttpPatientsGateway extends PatientsGateway {
  constructor(httpClient) {
    super();
    this.http = httpClient;
  }

  async findPatientById(patientId) {
    let response;
    try {
      response = await this.http.get(`/paciente/${encodeURIComponent(patientId)}`);
    } catch (err) {
      throw new ExternalServiceError(`G1 (Patients) request failed: ${err.message}`);
    }

    if (response.status === 404) return null;
    if (response.status >= 200 && response.status < 300) return response.data;

    throw new ExternalServiceError(
      `G1 (Patients) returned unexpected status ${response.status}.`,
    );
  }

  async listPatients() {
    let response;
    try {
      response = await this.http.get('/paciente');
    } catch (err) {
      throw new ExternalServiceError(`G1 (Patients) request failed: ${err.message}`);
    }

    // G1 returns 404 when there are no patients — treat as empty list.
    if (response.status === 404) return [];
    if (response.status >= 200 && response.status < 300) {
      return Array.isArray(response.data) ? response.data : [];
    }

    throw new ExternalServiceError(
      `G1 (Patients) returned unexpected status ${response.status}.`,
    );
  }
}
