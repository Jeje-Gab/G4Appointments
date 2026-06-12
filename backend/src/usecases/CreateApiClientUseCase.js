import { ValidationError } from '../errors/index.js';
import { generateApiKey, keyPrefix, sha256 } from '../infra/security/crypto.js';

// Generates a new API key for an external consumer module. The raw key is
// returned ONCE (so the admin can copy it); only its hash is persisted.
export class CreateApiClientUseCase {
  constructor({ apiClientRepository }) {
    this.apiClientRepository = apiClientRepository;
  }

  async execute({ name, scopes } = {}) {
    if (!name || !String(name).trim()) {
      throw new ValidationError('name is required.');
    }

    const rawKey = generateApiKey();
    const client = await this.apiClientRepository.create({
      name: String(name).trim(),
      keyHash: sha256(rawKey),
      keyPrefix: keyPrefix(rawKey),
      scopes: Array.isArray(scopes) && scopes.length ? scopes : ['read'],
    });

    // `apiKey` is included only here, never in list/read responses.
    return { client, apiKey: rawKey };
  }
}
