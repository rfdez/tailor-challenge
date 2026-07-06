export class InvalidReservationTimeError extends Error {
  constructor(time: string) {
    super();

    this.name = "InvalidReservationTimeError";
    this.message = `Time ${time} is not a valid slot for this restaurant.`;
  }
}
