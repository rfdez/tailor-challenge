import { faker } from "@faker-js/faker";
import { describe, expect, it } from "vitest";

import { ReservationCreator } from "../../../../../src/modules/reservations/application/create/ReservationCreator.js";
import { NegativeOrZeroReservationPartySizeError } from "../../../../../src/modules/reservations/domain/NegativeOrZeroReservationPartySizeError.js";
import { PastReservationDateError } from "../../../../../src/modules/reservations/domain/PastReservationDateError.js";
import { MockClock } from "../../../shared/domain/MockClock.js";
import { ReservationMother } from "../../domain/ReservationMother.js";
import { MockReservationRepository } from "../../infrastructure/MockReservationRepository.js";

describe("ReservationCreator should", { tags: "ci" }, () => {
  const clock = new MockClock();
  const repository = new MockReservationRepository();
  const creator = new ReservationCreator(repository, clock);

  it("create a reservation", async () => {
    const reservation = ReservationMother.confirmed();
    const primitives = reservation.toPrimitives();

    repository.shouldSave(reservation);

    await creator.create(
      primitives.id,
      primitives.restaurantId,
      primitives.userId,
      primitives.date,
      primitives.time,
      primitives.partySize,
    );
  });

  it("throw an error if the party size is negative or zero", async () => {
    const reservation = ReservationMother.create();
    const primitives = reservation.toPrimitives();

    await expect(
      creator.create(
        primitives.id,
        primitives.restaurantId,
        primitives.userId,
        primitives.date,
        primitives.time,
        0,
      ),
    ).rejects.toThrow(NegativeOrZeroReservationPartySizeError);
  });

  it("throw an error if the reservation date is in the past", async () => {
    const reservation = ReservationMother.create();
    const primitives = reservation.toPrimitives();

    const reservationDate = `${primitives.date}T${primitives.time}`;
    const futureDate = faker.date.soon({ refDate: reservationDate });

    clock.shouldGenerate(futureDate);

    await expect(
      creator.create(
        primitives.id,
        primitives.restaurantId,
        primitives.userId,
        primitives.date,
        primitives.time,
        primitives.partySize,
      ),
    ).rejects.toThrow(PastReservationDateError);
  });
});
