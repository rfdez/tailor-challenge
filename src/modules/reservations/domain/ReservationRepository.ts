import { Reservation } from "./Reservation.js";

export abstract class ReservationRepository {
  abstract save(reservation: Reservation): Promise<void>;
}
