import { afterAll, beforeEach, describe, it } from "vitest";

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
});
