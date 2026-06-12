// Creates a user (role 'admin' or 'user'). Needed to bootstrap the first admin
// (you can't log in to create the first one). After that, create more as needed.
//
// Usage: npm run create-user -- <username> <password> [role]
//   role defaults to 'user'. Use 'admin' for full access (API key management).
import { pool, closePool } from '../src/infra/database/pool.js';
import { PostgresUserRepository } from '../src/infra/database/PostgresUserRepository.js';
import { hashPassword } from '../src/infra/security/crypto.js';

async function run() {
  const [username, password, roleArg] = process.argv.slice(2);
  const role = roleArg || 'user';

  if (!username || !password) {
    console.error('Usage: npm run create-user -- <username> <password> [admin|user]');
    process.exit(1);
  }
  if (!['admin', 'user'].includes(role)) {
    console.error(`Invalid role "${role}". Use 'admin' or 'user'.`);
    process.exit(1);
  }
  if (password.length < 6) {
    console.error('Password must be at least 6 characters.');
    process.exit(1);
  }

  const repo = new PostgresUserRepository(pool);
  try {
    const user = await repo.createUser({
      username,
      passwordHash: hashPassword(password),
      role,
    });
    console.log(`User created: ${user.username} (role: ${user.role}, id: ${user.id})`);
  } catch (err) {
    console.error('[create-user] error:', err.message);
    process.exitCode = 1;
  } finally {
    await closePool();
  }
}

run();
