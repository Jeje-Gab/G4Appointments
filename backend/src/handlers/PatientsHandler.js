// HTTP proxy handler for G1 - Patients. Lets the frontend fetch patients
// without exposing the G1 token or base URL to the browser.
export class PatientsHandler {
  constructor({ listPatients }) {
    this.listPatientsUseCase = listPatients;
  }

  list = async (req, res, next) => {
    try {
      const patients = await this.listPatientsUseCase.execute();
      res.json({ data: patients });
    } catch (err) {
      next(err);
    }
  };
}
