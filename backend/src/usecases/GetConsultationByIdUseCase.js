import { ConsultationNotFoundError } from '../errors/index.js';

export class GetConsultationByIdUseCase {
  constructor({ consultationRepository }) {
    this.consultationRepository = consultationRepository;
  }

  async execute(id) {
    const consultation = await this.consultationRepository.findById(id);
    if (!consultation) {
      throw new ConsultationNotFoundError(`Consultation "${id}" was not found.`);
    }
    return consultation;
  }
}
