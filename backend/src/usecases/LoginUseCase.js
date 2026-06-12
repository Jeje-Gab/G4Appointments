import { UnauthorizedError, ValidationError } from '../errors/index.js';
import {
  generateSessionToken,
  sha256,
  verifyPassword,
} from '../infra/security/crypto.js';

// Authenticates any user (admin | user) and issues an opaque session token.
// The token is returned to the client; only its hash is stored.
export class LoginUseCase {
  constructor({ userRepository, sessionTtlHours = 12 }) {
    this.userRepository = userRepository;
    this.sessionTtlHours = sessionTtlHours;
  }

  async execute({ username, password } = {}) {
    if (!username || !password) {
      throw new ValidationError('username and password are required.');
    }

    const user = await this.userRepository.findUserByUsername(String(username).trim());
    // Same generic message whether the user exists or the password is wrong,
    // so we don't leak which usernames are valid.
    if (!user || !verifyPassword(password, user.passwordHash)) {
      throw new UnauthorizedError('Invalid credentials.');
    }

    const token = generateSessionToken();
    const expiresAt = new Date(Date.now() + this.sessionTtlHours * 60 * 60 * 1000);
    await this.userRepository.createSession({
      tokenHash: sha256(token),
      userId: user.id,
      expiresAt,
    });

    return {
      token,
      expiresAt,
      user: { id: user.id, username: user.username, role: user.role },
    };
  }
}
