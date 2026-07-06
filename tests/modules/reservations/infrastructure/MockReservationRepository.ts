import { expect, vi } from "vitest";

import { Reservation } from "../../../../src/modules/reservations/domain/Reservation.js";
import { ReservationRepository } from "../../../../src/modules/reservations/domain/ReservationRepository.js";

export class MockReservationRepository implements ReservationRepository {
  private readonly mockSave = vi.fn();

  private readonly mockSearchByRestaurantAndDate = vi.fn();

  async save(reservation: Reservation): Promise<void> {
    expect(this.mockSave).toHaveBeenCalledWith(reservation.toPrimitives());

    return Promise.resolve();
  }

  async searchByRestaurantAndDate(
    restaurantId: string,
    date: string,
  ): Promise<Reservation[]> {
    return this.mockSearchByRestaurantAndDate(restaurantId, date);
  }

  shouldSave(reservation: Reservation): void {
    this.mockSave(reservation.toPrimitives());
  }

  shouldSearchByRestaurantAndDateReturn(reservations: Reservation[]): void {
    this.mockSearchByRestaurantAndDate.mockReturnValueOnce(reservations);
  }
}
