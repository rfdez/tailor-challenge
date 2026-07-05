export class NegativeOrZeroReservationPartySizeError extends Error {
  constructor(partySize: number) {
    super();

    this.name = "NegativeOrZeroReservationPartySizeError";
    this.message = `Reservation party size ${partySize} cannot be negative or zero.`;
  }
}
