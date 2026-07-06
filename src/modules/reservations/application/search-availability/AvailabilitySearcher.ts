import type { Slot } from "../../domain/Slot.js";
import { RestaurantFinder } from "../../../restaurants/application/find/RestaurantFinder.js";
import { AvailabilityCalculator } from "../../domain/AvailabilityCalculator.js";
import { ReservationRepository } from "../../domain/ReservationRepository.js";

export class AvailabilitySearcher {
  constructor(
    private readonly restaurantFinder: RestaurantFinder,
    private readonly reservationRepository: ReservationRepository,
    private readonly calculator: AvailabilityCalculator,
  ) {}

  async search(
    restaurantId: string,
    date: string,
    partySize: number,
  ): Promise<Slot[]> {
    const restaurant = await this.restaurantFinder.find(restaurantId);
    const reservations =
      await this.reservationRepository.searchByRestaurantAndDate(
        restaurantId,
        date,
      );

    return this.calculator.calculate(
      restaurant.reservationSettings,
      date,
      reservations.map((r) => r.toPrimitives()),
      partySize,
    );
  }
}
