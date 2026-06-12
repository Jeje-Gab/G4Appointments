import { UnauthorizedError } from '../errors/index.js';
import { sha256 } from '../infra/security/crypto.js';

// Validates a session token (raw) and returns the authenticated user identity,
// including the role. Used by the `authenticate` middleware.
export class AuthenticateSessionUseCase {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  async execute(rawToken) {
    if (!rawToken) {
      throw new UnauthorizedError('Missing session token.');
    }
    const session = await this.userRepository.findValidSession(sha256(rawToken));
    if (!session) {
      throw new UnauthorizedError('Invalid or expired session.');
    }
    return { id: session.userId, username: session.username, role: session.role };
  }
}
