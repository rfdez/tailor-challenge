export class InsufficientAvailableSeatsError extends Error {
  constructor(partySize: number, availableSeats: number) {
    super();

    this.name = "InsufficientAvailableSeatsError";
    this.message = `Party size ${partySize} exceeds the ${availableSeats} available seats for this slot.`;
  }
}
