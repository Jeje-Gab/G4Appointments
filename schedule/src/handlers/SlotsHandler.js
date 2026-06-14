export class SlotsHandler {
  constructor(repository) {
    this.repo = repository;
  }

  list = async (req, res) => {
    const available = req.query.available === 'true' ? true
      : req.query.available === 'false' ? false
      : undefined;
    const slots = await this.repo.list({ available });
    res.json({ data: slots });
  };

  getById = async (req, res) => {
    const slot = await this.repo.findById(req.params.id);
    if (!slot) return res.status(404).json({ error: true, message: 'Slot not found.' });
    res.json({ data: slot });
  };

  create = async (req, res) => {
    const { id, startsAt, doctorName, specialty } = req.body || {};
    if (!id || !startsAt || !doctorName || !specialty) {
      return res.status(400).json({ error: true, message: 'id, startsAt, doctorName and specialty are required.' });
    }
    try {
      const slot = await this.repo.create({ id, startsAt, doctorName, specialty });
      res.status(201).json({ data: slot });
    } catch (err) {
      if (err.code === '23505') {
        return res.status(409).json({ error: true, message: `Slot "${id}" already exists.` });
      }
      throw err;
    }
  };

  reserve = async (req, res) => {
    const slot = await this.repo.findById(req.params.id);
    if (!slot) return res.status(404).json({ error: true, message: 'Slot not found.' });
    if (!slot.available) return res.status(409).json({ error: true, message: 'Slot is not available.' });
    const updated = await this.repo.setAvailable(req.params.id, false);
    res.json({ data: updated });
  };

  release = async (req, res) => {
    const slot = await this.repo.findById(req.params.id);
    if (!slot) return res.status(404).json({ error: true, message: 'Slot not found.' });
    const updated = await this.repo.setAvailable(req.params.id, true);
    res.json({ data: updated });
  };
}
