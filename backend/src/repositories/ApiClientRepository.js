/* eslint-disable no-unused-vars */
// Contract (port) for API client persistence (external consumer credentials).
export class ApiClientRepository {
  // Persist a new client. Input: { name, keyHash, keyPrefix, scopes }.
  async create(data) {
    throw new Error('ApiClientRepository.create not implemented');
  }

  // Find an active (non-revoked) client by the hash of its key, or null.
  async findActiveByKeyHash(keyHash) {
    throw new Error('ApiClientRepository.findActiveByKeyHash not implemented');
  }

  // List all clients (without secrets) ordered by creation date.
  async list() {
    throw new Error('ApiClientRepository.list not implemented');
  }

  // Revoke a client by id; returns the updated row or null if not found.
  async revoke(id) {
    throw new Error('ApiClientRepository.revoke not implemented');
  }

  // Update last_used_at for auditing. Best-effort, returns nothing.
  async touchLastUsed(id) {
    throw new Error('ApiClientRepository.touchLastUsed not implemented');
  }
}
