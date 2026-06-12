/* eslint-disable no-unused-vars */
// Contract (port) for users (admin | user) and their login sessions.
export class UserRepository {
  // Create a user. Input: { username, passwordHash, role }.
  async createUser(data) {
    throw new Error('UserRepository.createUser not implemented');
  }

  // Find a user by username, or null. Returns { id, username, passwordHash, role }.
  async findUserByUsername(username) {
    throw new Error('UserRepository.findUserByUsername not implemented');
  }

  // Find a user by id, or null. Returns { id, username, role }.
  async findUserById(id) {
    throw new Error('UserRepository.findUserById not implemented');
  }

  // List all users (without secrets), ordered by creation date.
  async listUsers() {
    throw new Error('UserRepository.listUsers not implemented');
  }

  // Update a user's password hash by id. Returns the updated user or null.
  async updatePassword(id, passwordHash) {
    throw new Error('UserRepository.updatePassword not implemented');
  }

  // Persist a new session. Input: { tokenHash, userId, expiresAt }.
  async createSession(data) {
    throw new Error('UserRepository.createSession not implemented');
  }

  // Find a non-expired session by token hash, joined with the user, or null.
  // Returns { userId, username, role, expiresAt }.
  async findValidSession(tokenHash) {
    throw new Error('UserRepository.findValidSession not implemented');
  }

  // Delete a session by token hash (logout).
  async deleteSession(tokenHash) {
    throw new Error('UserRepository.deleteSession not implemented');
  }

  // Delete all sessions of a user (e.g. after a password reset).
  async deleteUserSessions(userId) {
    throw new Error('UserRepository.deleteUserSessions not implemented');
  }
}
