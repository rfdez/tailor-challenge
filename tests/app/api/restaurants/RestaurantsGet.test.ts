import { afterAll, beforeAll, describe, expect, it } from "vitest";

import app from "../../../../src/app/app.js";
import { PostgresRestaurantRepository } from "../../../../src/modules/restaurants/infrastructure/PostgresRestaurantRepository.js";
import { config } from "../../../../src/modules/shared/infrastructure/config.js";
import { PostgresConnection } from "../../../../src/modules/shared/infrastructure/PostgresConnection.js";
import { RestaurantMother } from "../../../modules/restaurants/domain/RestaurantMother.js";

describe("GET /restaurants should", () => {
  const connection = new PostgresConnection(config.postgres.url);
  const repository = new PostgresRestaurantRepository(connection);

  beforeAll(async () => {
    await connection.truncateAll();
  });

  afterAll(async () => {
    await connection.end();
  });

  it("return an empty array when no restaurants are saved", async () => {
    const res = await app.request("/restaurants");

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ restaurants: [] });
  });

  it("return all restaurants", async () => {
    const restaurant1 = RestaurantMother.create();
    const restaurant2 = RestaurantMother.create();

    await repository.save(restaurant1);
    await repository.save(restaurant2);

    const res = await app.request("/restaurants");

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      restaurants: expect.arrayContaining([
        restaurant1.toPrimitives(),
        restaurant2.toPrimitives(),
      ]),
    });
  });
});
