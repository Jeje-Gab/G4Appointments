// HTTP proxy handler for the Schedule module.
// Lets the frontend fetch available slots without knowing the schedule service URL.
export class SlotsHandler {
  constructor({ listAvailableSlots, listAllSlots, createSlot }) {
    this.listAvailableSlotsUseCase = listAvailableSlots;
    this.listAllSlotsUseCase = listAllSlots;
    this.createSlotUseCase = createSlot;
  }

  list = async (req, res, next) => {
    try {
      const slots = await this.listAvailableSlotsUseCase.execute();
      res.json({ data: slots });
    } catch (err) {
      next(err);
    }
  };

  listAll = async (req, res, next) => {
    try {
      const slots = await this.listAllSlotsUseCase.execute();
      res.json({ data: slots });
    } catch (err) {
      next(err);
    }
  };

  create = async (req, res, next) => {
    try {
      const { startsAt, doctorName, specialty } = req.body || {};
      const slot = await this.createSlotUseCase.execute({ startsAt, doctorName, specialty });
      res.status(201).json({ data: slot });
    } catch (err) {
      next(err);
    }
  };
}
