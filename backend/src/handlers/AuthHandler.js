// HTTP controllers for authentication (login/logout/me). Works for any role.
export class AuthHandler {
  constructor(useCases) {
    this.useCases = useCases;
  }

  login = async (req, res, next) => {
    try {
      const { username, password } = req.body || {};
      const result = await this.useCases.login.execute({ username, password });
      res.json({
        data: {
          token: result.token,
          expiresAt: result.expiresAt,
          user: result.user,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  logout = async (req, res, next) => {
    try {
      await this.useCases.logout.execute(req.sessionToken);
      res.json({ data: { ok: true } });
    } catch (err) {
      next(err);
    }
  };

  me = async (req, res) => {
    res.json({ data: { user: req.user } });
  };
}
