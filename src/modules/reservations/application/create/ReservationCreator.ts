import { Clock } from "../../../shared/domain/Clock.js";
import { RestaurantFinder } from "../../../restaurants/application/find/RestaurantFinder.js";
import { AvailabilityCalculator } from "../../domain/AvailabilityCalculator.js";
import { InsufficientAvailableSeatsError } from "../../domain/InsufficientAvailableSeatsError.js";
import { InvalidReservationTimeError } from "../../domain/InvalidReservationTimeError.js";
import { Reservation } from "../../domain/Reservation.js";
import { ReservationRepository } from "../../domain/ReservationRepository.js";

export class ReservationCreator {
  constructor(
    private readonly repository: ReservationRepository,
    private readonly restaurantFinder: RestaurantFinder,
    private readonly calculator: AvailabilityCalculator,
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

    const restaurant = await this.restaurantFinder.find(restaurantId);

    const existing = await this.repository.searchByRestaurantAndDate(
      restaurantId,
      date,
    );
    const slots = this.calculator.calculate(
      restaurant.reservationSettings,
      date,
      existing.map((r) => r.toPrimitives()),
      partySize,
    );

    const slot = slots.find((s) => s.time === time);
    if (!slot) {
      throw new InvalidReservationTimeError(time);
    }

    if (!slot.available) {
      throw new InsufficientAvailableSeatsError(partySize, slot.availableSeats);
    }

    await this.repository.save(reservation);
  }
}
