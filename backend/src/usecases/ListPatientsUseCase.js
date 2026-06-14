export class ListPatientsUseCase {
  constructor({ patientsGateway }) {
    this.patientsGateway = patientsGateway;
  }

  async execute() {
    return this.patientsGateway.listPatients();
  }
}
