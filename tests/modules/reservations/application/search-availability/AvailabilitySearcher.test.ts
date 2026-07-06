import { faker } from "@faker-js/faker";
import { describe, expect, it } from "vitest";

import { AvailabilitySearcher } from "../../../../../src/modules/reservations/application/search-availability/AvailabilitySearcher.js";
import { AvailabilityCalculator } from "../../../../../src/modules/reservations/domain/AvailabilityCalculator.js";
import { RestaurantDoesNotExistError } from "../../../../../src/modules/restaurants/domain/RestaurantDoesNotExistError.js";
import { RestaurantFinder } from "../../../../../src/modules/restaurants/application/find/RestaurantFinder.js";
import { RestaurantMother } from "../../../restaurants/domain/RestaurantMother.js";
import { ReservationMother } from "../../domain/ReservationMother.js";
import { MockRestaurantRepository } from "../../../restaurants/infrastructure/MockRestaurantRepository.js";
import { MockReservationRepository } from "../../infrastructure/MockReservationRepository.js";

describe("AvailabilitySearcher should", { tags: "ci" }, () => {
  const restaurantRepository = new MockRestaurantRepository();
  const reservationRepository = new MockReservationRepository();
  const restaurantFinder = new RestaurantFinder(restaurantRepository);
  const calculator = new AvailabilityCalculator();
  const searcher = new AvailabilitySearcher(
    restaurantFinder,
    reservationRepository,
    calculator,
  );

  it("return availability slots for an existing restaurant with reservations", async () => {
    const restaurant = RestaurantMother.create();
    const primitives = restaurant.toPrimitives();
    const date = "2026-07-10";

    const reservation = ReservationMother.create({
      restaurantId: primitives.id,
      date,
      time: "13:00",
      partySize: 4,
      status: "confirmed",
    });

    restaurantRepository.shouldSearchReturn(restaurant);
    reservationRepository.shouldSearchByRestaurantAndDateReturn([reservation]);

    const slots = await searcher.search(primitives.id, date, 4);

    expect(slots).toBeInstanceOf(Array);
    expect(slots.length).toBeGreaterThan(0);

    const bookedSlot = slots.find((s) => s.time === "13:00");
    expect(bookedSlot).toBeDefined();
    expect(bookedSlot?.reservedSeats).toBe(4);
  });

  it("throw RestaurantDoesNotExistError when restaurant does not exist", async () => {
    const id = faker.string.uuid();

    restaurantRepository.shouldSearchReturn(null);

    await expect(searcher.search(id, "2026-07-10", 4)).rejects.toThrow(
      RestaurantDoesNotExistError,
    );
  });
});
