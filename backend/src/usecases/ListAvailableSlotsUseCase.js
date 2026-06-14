export class ListAvailableSlotsUseCase {
  constructor({ scheduleGateway }) {
    this.scheduleGateway = scheduleGateway;
  }

  async execute() {
    return this.scheduleGateway.listAvailableSlots();
  }
}
