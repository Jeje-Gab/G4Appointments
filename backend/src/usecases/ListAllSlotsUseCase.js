export class ListAllSlotsUseCase {
  constructor({ scheduleGateway }) {
    this.scheduleGateway = scheduleGateway;
  }

  async execute() {
    return this.scheduleGateway.listAllSlots();
  }
}
