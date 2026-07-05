import {
  Reservation,
  type ReservationPrimitives,
} from "../domain/Reservation.js";
import { ReservationRepository } from "../domain/ReservationRepository.js";

export class InMemoryReservationRepository implements ReservationRepository {
  private readonly reservations: ReservationPrimitives[];

  constructor() {
    this.reservations = [];
  }

  async save(reservation: Reservation): Promise<void> {
    this.reservations.push(reservation.toPrimitives());
  }
}
