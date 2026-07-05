import { afterAll, beforeEach, describe, it } from "vitest";

import { PostgresReservationRepository } from "../../../../src/modules/reservations/infrastructure/PostgresReservationRepository.js";
import { PostgresConnectionFactory } from "../../../../src/modules/shared/infrastructure/PostgresConnectionFactory.js";
import { ReservationMother } from "../domain/ReservationMother.js";

describe("PostgresReservationRepository should", () => {
  const connection = PostgresConnectionFactory.create();
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
});
