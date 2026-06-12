// Lists API clients (no secrets) for the admin screen.
export class ListApiClientsUseCase {
  constructor({ apiClientRepository }) {
    this.apiClientRepository = apiClientRepository;
  }

  async execute() {
    return this.apiClientRepository.list();
  }
}
