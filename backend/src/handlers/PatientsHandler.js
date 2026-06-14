// HTTP proxy handler for G1 - Patients. Lets the frontend fetch/create patients
// without exposing the G1 token or base URL to the browser.
export class PatientsHandler {
  constructor({ listPatients, getPatientById, createPatient }) {
    this.listPatientsUseCase = listPatients;
    this.getPatientByIdUseCase = getPatientById;
    this.createPatientUseCase = createPatient;
  }

  list = async (req, res, next) => {
    try {
      const patients = await this.listPatientsUseCase.execute();
      res.json({ data: patients });
    } catch (err) {
      next(err);
    }
  };

  getById = async (req, res, next) => {
    try {
      const patient = await this.getPatientByIdUseCase.execute(req.params.id);
      res.json({ data: patient });
    } catch (err) {
      next(err);
    }
  };

  create = async (req, res, next) => {
    try {
      const patient = await this.createPatientUseCase.execute(req.body || {});
      res.status(201).json({ data: patient });
    } catch (err) {
      next(err);
    }
  };
}
