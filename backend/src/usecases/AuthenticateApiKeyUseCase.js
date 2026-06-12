import { UnauthorizedError } from '../errors/index.js';
import { sha256 } from '../infra/security/crypto.js';

// Validates an incoming API key (raw) and returns the owning client.
// Used by the apiKeyAuth middleware that protects the external /external/v1 API.
export class AuthenticateApiKeyUseCase {
  constructor({ apiClientRepository }) {
    this.apiClientRepository = apiClientRepository;
  }

  async execute(rawKey) {
    if (!rawKey) {
      throw new UnauthorizedError('Missing API key.');
    }
    const client = await this.apiClientRepository.findActiveByKeyHash(sha256(rawKey));
    if (!client) {
      throw new UnauthorizedError('Invalid or revoked API key.');
    }
    // Audit the usage (best-effort, non-blocking failure inside the repo).
    await this.apiClientRepository.touchLastUsed(client.id);
    return client;
  }
}
