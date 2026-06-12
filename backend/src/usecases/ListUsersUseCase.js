// Lists users (no secrets) for the admin "Usuários" screen.
export class ListUsersUseCase {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  async execute() {
    return this.userRepository.listUsers();
  }
}
