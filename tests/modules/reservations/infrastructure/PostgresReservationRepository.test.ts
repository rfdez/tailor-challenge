import { faker } from "@faker-js/faker";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { PostgresReservationRepository } from "../../../../src/modules/reservations/infrastructure/PostgresReservationRepository.js";
import { config } from "../../../../src/modules/shared/infrastructure/config.js";
import { PostgresConnection } from "../../../../src/modules/shared/infrastructure/PostgresConnection.js";
import { ReservationMother } from "../domain/ReservationMother.js";

describe("PostgresReservationRepository should", () => {
  const connection = new PostgresConnection(config.postgres.url);
  const repository = new PostgresReservationRepository(connection);

  beforeEach(async () => {
    await connection.truncateAll();
  });

  afterAll(async () => {
    await connection.end();
  });

  it("save a reservation", async () => {
    const reservation = ReservationMother.confirmed();

    await repository.save(reservation);
  });

  it("return only confirmed reservations for a restaurant and date", async () => {
    const restaurantId = faker.string.uuid();
    const date = faker.date.soon().toISOString().split("T")[0] ?? "";
    const confirmed = ReservationMother.confirmedWithRestaurantAndDate(
      restaurantId,
      date,
    );
    const cancelled = ReservationMother.create({
      restaurantId,
      date,
      status: "cancelled",
    });

    await repository.save(confirmed);
    await repository.save(cancelled);

    const result = await repository.searchByRestaurantAndDate(
      restaurantId,
      date,
    );

    expect(result).toHaveLength(1);
    expect(result[0]?.toPrimitives()).toEqual(confirmed.toPrimitives());
  });
});
