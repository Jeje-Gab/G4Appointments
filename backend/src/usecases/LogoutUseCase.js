import { sha256 } from '../infra/security/crypto.js';

// Invalidates a session (logout).
export class LogoutUseCase {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  async execute(rawToken) {
    if (!rawToken) return;
    await this.userRepository.deleteSession(sha256(rawToken));
  }
}
