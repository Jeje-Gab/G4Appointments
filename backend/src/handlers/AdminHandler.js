// HTTP controllers for the admin area: API key management. These routes are
// guarded by `requireRole('admin')`. Business rules live in the use cases.
export class AdminHandler {
  constructor(useCases) {
    this.useCases = useCases;
  }

  listClients = async (req, res, next) => {
    try {
      const clients = await this.useCases.listApiClients.execute();
      res.json({ data: clients });
    } catch (err) {
      next(err);
    }
  };

  createClient = async (req, res, next) => {
    try {
      const { name, scopes } = req.body || {};
      const { client, apiKey } = await this.useCases.createApiClient.execute({ name, scopes });
      // The raw apiKey is returned ONLY here — it cannot be recovered later.
      res.status(201).json({ data: { client, apiKey } });
    } catch (err) {
      next(err);
    }
  };

  revokeClient = async (req, res, next) => {
    try {
      const client = await this.useCases.revokeApiClient.execute(req.params.id);
      res.json({ data: client });
    } catch (err) {
      next(err);
    }
  };

  // ----- User management (admin only) -----

  listUsers = async (req, res, next) => {
    try {
      const users = await this.useCases.listUsers.execute();
      res.json({ data: users });
    } catch (err) {
      next(err);
    }
  };

  createUser = async (req, res, next) => {
    try {
      const { username, password, role } = req.body || {};
      const user = await this.useCases.createUser.execute({ username, password, role });
      res.status(201).json({ data: user });
    } catch (err) {
      next(err);
    }
  };

  changeUserPassword = async (req, res, next) => {
    try {
      const { password } = req.body || {};
      const user = await this.useCases.changeUserPassword.execute(req.params.id, password);
      res.json({ data: user });
    } catch (err) {
      next(err);
    }
  };
}
