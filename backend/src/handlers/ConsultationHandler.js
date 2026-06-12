import { CreateConsultationDTO } from '../dtos/CreateConsultationDTO.js';
import { UpdateConsultationStatusDTO } from '../dtos/UpdateConsultationStatusDTO.js';
import {
  ConsultationResponseDTO,
  ConsultationListResponseDTO,
} from '../dtos/ConsultationResponseDTO.js';
import { PatientHistoryResponseDTO } from '../dtos/PatientHistoryResponseDTO.js';

// HTTP controllers. They translate between HTTP and use cases:
// parse/validate input via DTOs, call the use case, shape the response.
// No business rules live here. Errors are forwarded to the error middleware
// via `next(err)`.
export class ConsultationHandler {
  constructor(useCases) {
    this.useCases = useCases;
  }

  create = async (req, res, next) => {
    try {
      const dto = CreateConsultationDTO(req.body);
      const consultation = await this.useCases.createConsultation.execute(dto);
      res.status(201).json({ data: ConsultationResponseDTO(consultation) });
    } catch (err) {
      next(err);
    }
  };

  list = async (req, res, next) => {
    try {
      const { status, patientId, startDate, endDate } = req.query;
      const consultations = await this.useCases.listConsultations.execute({
        status,
        patientId,
        startDate,
        endDate,
      });
      res.json({ data: ConsultationListResponseDTO(consultations) });
    } catch (err) {
      next(err);
    }
  };

  getById = async (req, res, next) => {
    try {
      const consultation = await this.useCases.getConsultationById.execute(req.params.id);
      res.json({ data: ConsultationResponseDTO(consultation) });
    } catch (err) {
      next(err);
    }
  };

  updateStatus = async (req, res, next) => {
    try {
      const { status } = UpdateConsultationStatusDTO(req.body);
      const consultation = await this.useCases.updateConsultationStatus.execute(
        req.params.id,
        status,
      );
      res.json({ data: ConsultationResponseDTO(consultation) });
    } catch (err) {
      next(err);
    }
  };

  cancel = async (req, res, next) => {
    try {
      const consultation = await this.useCases.cancelConsultation.execute(req.params.id);
      res.json({ data: ConsultationResponseDTO(consultation) });
    } catch (err) {
      next(err);
    }
  };

  patientHistory = async (req, res, next) => {
    try {
      const { patientId } = req.params;
      const consultations = await this.useCases.getPatientHistory.execute(patientId);
      res.json({ data: PatientHistoryResponseDTO(patientId, consultations) });
    } catch (err) {
      next(err);
    }
  };
}
