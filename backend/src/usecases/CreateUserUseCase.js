import { ValidationError } from '../errors/index.js';
import { hashPassword } from '../infra/security/crypto.js';

const VALID_ROLES = ['admin', 'user'];
const MIN_PASSWORD = 6;

// Admin-only: creates a new user (admin | user). The password is hashed with
// scrypt before being stored; the raw password is never persisted.
export class CreateUserUseCase {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  async execute({ username, password, role = 'user' } = {}) {
    const name = typeof username === 'string' ? username.trim() : '';
    if (!name) throw new ValidationError('username is required.');
    if (!password || String(password).length < MIN_PASSWORD) {
      throw new ValidationError(`password must be at least ${MIN_PASSWORD} characters.`);
    }
    if (!VALID_ROLES.includes(role)) {
      throw new ValidationError(`role must be one of: ${VALID_ROLES.join(', ')}.`);
    }

    // Uniqueness is enforced by the DB (unique username) -> DatabaseError on clash.
    const user = await this.userRepository.createUser({
      username: name,
      passwordHash: hashPassword(password),
      role,
    });
    return { id: user.id, username: user.username, role: user.role };
  }
}
