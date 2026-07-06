import { faker } from "@faker-js/faker";
import { describe, expect, it } from "vitest";

import { ReservationsByRestaurantAndDateSearcher } from "../../../../../src/modules/reservations/application/search-by-restaurant-and-date/ReservationsByRestaurantAndDateSearcher.js";
import { ReservationMother } from "../../domain/ReservationMother.js";
import { MockReservationRepository } from "../../infrastructure/MockReservationRepository.js";

describe(
  "ReservationsByRestaurantAndDateSearcher should",
  { tags: "ci" },
  () => {
    const repository = new MockReservationRepository();
    const searcher = new ReservationsByRestaurantAndDateSearcher(repository);

    it("return confirmed reservations for a restaurant and date", async () => {
      const restaurantId = faker.string.uuid();
      const date = faker.date.soon().toISOString().split("T")[0] ?? "";
      const reservations = ReservationMother.multiple(3);

      repository.shouldSearchByRestaurantAndDateReturn(reservations);

      const result = await searcher.search(restaurantId, date);

      expect(result).toEqual(
        reservations.map((reservation) => reservation.toPrimitives()),
      );
    });
  },
);
