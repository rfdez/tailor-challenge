import type { ReservationPrimitives } from "../../domain/Reservation.js";
import { ReservationRepository } from "../../domain/ReservationRepository.js";

export class ReservationsByRestaurantAndDateSearcher {
  constructor(private readonly repository: ReservationRepository) {}

  async search(
    restaurantId: string,
    date: string,
  ): Promise<ReservationPrimitives[]> {
    const reservations = await this.repository.searchByRestaurantAndDate(
      restaurantId,
      date,
    );

    return reservations.map((reservation) => reservation.toPrimitives());
  }
}
