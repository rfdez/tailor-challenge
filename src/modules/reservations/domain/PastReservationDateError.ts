export class PastReservationDateError extends Error {
  constructor(date: string) {
    super();

    this.name = "PastReservationDateError";
    this.message = `Reservation date ${date} cannot be in the past`;
  }
}
