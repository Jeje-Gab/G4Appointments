import { AppError } from '../errors/index.js';

// Revokes (deactivates) an API client. The key stops working immediately on the
// next request. We never delete the row, keeping an audit trail.
export class RevokeApiClientUseCase {
  constructor({ apiClientRepository }) {
    this.apiClientRepository = apiClientRepository;
  }

  async execute(id) {
    const client = await this.apiClientRepository.revoke(id);
    if (!client) {
      throw new AppError('API client not found.', {
        statusCode: 404,
        code: 'API_CLIENT_NOT_FOUND',
      });
    }
    return client;
  }
}
