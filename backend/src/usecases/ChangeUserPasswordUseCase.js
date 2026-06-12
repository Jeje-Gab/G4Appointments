import { ValidationError, AppError } from '../errors/index.js';
import { hashPassword } from '../infra/security/crypto.js';

const MIN_PASSWORD = 6;

// Admin-only: resets the password of a user (by id). After changing it, all of
// that user's existing sessions are invalidated, forcing a fresh login.
export class ChangeUserPasswordUseCase {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  async execute(id, newPassword) {
    if (!newPassword || String(newPassword).length < MIN_PASSWORD) {
      throw new ValidationError(`password must be at least ${MIN_PASSWORD} characters.`);
    }

    const user = await this.userRepository.findUserById(id);
    if (!user) {
      throw new AppError('User not found.', { statusCode: 404, code: 'USER_NOT_FOUND' });
    }

    const updated = await this.userRepository.updatePassword(id, hashPassword(newPassword));
    // Invalidate existing sessions so the old password can't keep a session alive.
    await this.userRepository.deleteUserSessions(id);
    return { id: updated.id, username: updated.username, role: updated.role };
  }
}
