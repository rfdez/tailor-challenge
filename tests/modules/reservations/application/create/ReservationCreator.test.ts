import { faker } from "@faker-js/faker";
import { describe, expect, it } from "vitest";

import { ReservationCreator } from "../../../../../src/modules/reservations/application/create/ReservationCreator.js";
import { AvailabilityCalculator } from "../../../../../src/modules/reservations/domain/AvailabilityCalculator.js";
import { InsufficientAvailableSeatsError } from "../../../../../src/modules/reservations/domain/InsufficientAvailableSeatsError.js";
import { InvalidReservationTimeError } from "../../../../../src/modules/reservations/domain/InvalidReservationTimeError.js";
import { NegativeOrZeroReservationPartySizeError } from "../../../../../src/modules/reservations/domain/NegativeOrZeroReservationPartySizeError.js";
import { PastReservationDateError } from "../../../../../src/modules/reservations/domain/PastReservationDateError.js";
import { RestaurantFinder } from "../../../../../src/modules/restaurants/application/find/RestaurantFinder.js";
import { MockClock } from "../../../shared/domain/MockClock.js";
import { ReservationMother } from "../../domain/ReservationMother.js";
import { RestaurantMother } from "../../../restaurants/domain/RestaurantMother.js";
import { MockReservationRepository } from "../../infrastructure/MockReservationRepository.js";
import { MockRestaurantRepository } from "../../../restaurants/infrastructure/MockRestaurantRepository.js";

describe("ReservationCreator should", { tags: "ci" }, () => {
  const clock = new MockClock();
  const reservationRepository = new MockReservationRepository();
  const restaurantRepository = new MockRestaurantRepository();
  const restaurantFinder = new RestaurantFinder(restaurantRepository);
  const calculator = new AvailabilityCalculator();
  const creator = new ReservationCreator(
    reservationRepository,
    restaurantFinder,
    calculator,
    clock,
  );

  it("create a reservation", async () => {
    const restaurant = RestaurantMother.withLunchWindow();
    const restaurantId = restaurant.toPrimitives().id;
    const id = faker.string.uuid();
    const userId = faker.string.uuid();

    const expectedReservation = ReservationMother.create({
      id,
      restaurantId,
      userId,
      date: "2026-07-10",
      time: "13:00",
      partySize: 4,
      status: "confirmed",
    });

    restaurantRepository.shouldSearchReturn(restaurant);
    reservationRepository.shouldSearchByRestaurantAndDateReturn([]);
    reservationRepository.shouldSave(expectedReservation);

    await creator.create(id, restaurantId, userId, "2026-07-10", "13:00", 4);
  });

  it("throw an error if the party size is negative or zero", async () => {
    const id = faker.string.uuid();
    const restaurantId = faker.string.uuid();
    const userId = faker.string.uuid();

    await expect(
      creator.create(id, restaurantId, userId, "2026-07-10", "13:00", 0),
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

  it("throw InvalidReservationTimeError when the time does not match a generated slot", async () => {
    const restaurant = RestaurantMother.withLunchWindow();
    const restaurantId = restaurant.toPrimitives().id;
    const id = faker.string.uuid();
    const userId = faker.string.uuid();

    restaurantRepository.shouldSearchReturn(restaurant);
    reservationRepository.shouldSearchByRestaurantAndDateReturn([]);

    await expect(
      creator.create(id, restaurantId, userId, "2026-07-10", "18:00", 4),
    ).rejects.toThrow(InvalidReservationTimeError);
  });

  it("throw InsufficientAvailableSeatsError when the slot is full", async () => {
    const restaurant = RestaurantMother.withLunchWindow();
    const restaurantId = restaurant.toPrimitives().id;
    const id = faker.string.uuid();
    const userId = faker.string.uuid();

    const existing = ReservationMother.confirmedAt("2026-07-10", "13:00", 8);

    restaurantRepository.shouldSearchReturn(restaurant);
    reservationRepository.shouldSearchByRestaurantAndDateReturn([existing]);

    await expect(
      creator.create(id, restaurantId, userId, "2026-07-10", "13:00", 4),
    ).rejects.toThrow(InsufficientAvailableSeatsError);
  });

  it("throw InsufficientAvailableSeatsError when party size exceeds available seats", async () => {
    const restaurant = RestaurantMother.withLunchWindow();
    const restaurantId = restaurant.toPrimitives().id;
    const id = faker.string.uuid();
    const userId = faker.string.uuid();

    const existing = ReservationMother.confirmedAt("2026-07-10", "13:00", 3);

    restaurantRepository.shouldSearchReturn(restaurant);
    reservationRepository.shouldSearchByRestaurantAndDateReturn([existing]);

    await expect(
      creator.create(id, restaurantId, userId, "2026-07-10", "13:00", 6),
    ).rejects.toThrow(InsufficientAvailableSeatsError);
  });
});
