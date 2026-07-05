import { Clock } from "../../../shared/domain/Clock.js";
import { Reservation } from "../../domain/Reservation.js";
import { ReservationRepository } from "../../domain/ReservationRepository.js";

export class ReservationCreator {
  constructor(
    private readonly repository: ReservationRepository,
    private readonly clock: Clock,
  ) {}

  async create(
    id: string,
    restaurantId: string,
    userId: string,
    date: string,
    time: string,
    partySize: number,
  ): Promise<void> {
    const reservation = Reservation.create(
      id,
      restaurantId,
      userId,
      date,
      time,
      partySize,
      this.clock,
    );

    await this.repository.save(reservation);
  }
}
