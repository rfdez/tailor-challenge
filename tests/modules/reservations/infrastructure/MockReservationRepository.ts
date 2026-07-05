import { expect, vi } from "vitest";

import { Reservation } from "../../../../src/modules/reservations/domain/Reservation.js";
import { ReservationRepository } from "../../../../src/modules/reservations/domain/ReservationRepository.js";

export class MockReservationRepository implements ReservationRepository {
  private readonly mockSave = vi.fn();

  async save(reservation: Reservation): Promise<void> {
    expect(this.mockSave).toHaveBeenCalledWith(reservation.toPrimitives());

    return Promise.resolve();
  }

  shouldSave(reservation: Reservation): void {
    this.mockSave(reservation.toPrimitives());
  }
}
