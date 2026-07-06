import { faker } from "@faker-js/faker";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import app from "../../../../src/app/app.js";
import { PostgresRestaurantRepository } from "../../../../src/modules/restaurants/infrastructure/PostgresRestaurantRepository.js";
import { config } from "../../../../src/modules/shared/infrastructure/config.js";
import { PostgresConnection } from "../../../../src/modules/shared/infrastructure/PostgresConnection.js";
import { RestaurantMother } from "../../../modules/restaurants/domain/RestaurantMother.js";

describe("GET /restaurants/:restaurantId/availability should", () => {
  const connection = new PostgresConnection(config.postgres.url);
  const restaurantRepository = new PostgresRestaurantRepository(connection);

  beforeAll(async () => {
    await connection.truncateAll();
  });

  afterAll(async () => {
    await connection.end();
  });

  it("return the slots envelope with 200 for an existing restaurant", async () => {
    const restaurant = RestaurantMother.create();
    const primitives = restaurant.toPrimitives();

    await restaurantRepository.save(restaurant);

    const res = await app.request(
      `/restaurants/${primitives.id}/availability?date=2026-07-10&partySize=4`,
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      slots: expect.arrayContaining([
        expect.objectContaining({
          available: expect.any(Boolean),
          availableSeats: expect.any(Number),
          capacity: expect.any(Number),
          reservedSeats: expect.any(Number),
          time: expect.any(String),
        }),
      ]),
    });
  });

  it("return 400 when date is invalid", async () => {
    const res = await app.request(
      `/restaurants/${faker.string.uuid()}/availability?date=not-a-date&partySize=4`,
    );

    expect(res.status).toBe(400);
  });

  it("return 400 when partySize is not positive", async () => {
    const res = await app.request(
      `/restaurants/${faker.string.uuid()}/availability?date=2026-07-10&partySize=0`,
    );

    expect(res.status).toBe(400);
  });

  it("return 404 when restaurant does not exist", async () => {
    const res = await app.request(
      `/restaurants/${faker.string.uuid()}/availability?date=2026-07-10&partySize=4`,
    );

    expect(res.status).toBe(404);
  });
});
