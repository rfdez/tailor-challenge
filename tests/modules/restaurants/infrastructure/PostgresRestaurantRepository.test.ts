import { faker } from "@faker-js/faker";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { PostgresRestaurantRepository } from "../../../../src/modules/restaurants/infrastructure/PostgresRestaurantRepository.js";
import { config } from "../../../../src/modules/shared/infrastructure/config.js";
import { PostgresConnection } from "../../../../src/modules/shared/infrastructure/PostgresConnection.js";
import { RestaurantMother } from "../domain/RestaurantMother.js";

describe("PostgresRestaurantRepository should", () => {
  const connection = new PostgresConnection(config.postgres.url);
  const repository = new PostgresRestaurantRepository(connection);

  beforeEach(async () => {
    await connection.truncateAll();
  });

  afterAll(async () => {
    await connection.end();
  });

  it("save a restaurant", async () => {
    const restaurant = RestaurantMother.create();

    await repository.save(restaurant);
  });

  it("return an empty array when no restaurants are saved", async () => {
    const restaurants = await repository.searchAll();

    expect(restaurants).toHaveLength(0);
    expect(restaurants).toEqual([]);
  });

  it("return all restaurants", async () => {
    const restaurant1 = RestaurantMother.create();
    const restaurant2 = RestaurantMother.create();

    await repository.save(restaurant1);
    await repository.save(restaurant2);

    const restaurants = await repository.searchAll();

    expect(restaurants).toHaveLength(2);
    expect(restaurants.map((d) => d.toPrimitives())).toEqual(
      expect.arrayContaining([
        restaurant1.toPrimitives(),
        restaurant2.toPrimitives(),
      ]),
    );
  });

  it("return a restaurant by id", async () => {
    const restaurant = RestaurantMother.create();

    await repository.save(restaurant);

    const result = await repository.search(restaurant.toPrimitives().id);

    expect(result).not.toBeNull();
    expect(result?.toPrimitives()).toEqual(restaurant.toPrimitives());
  });

  it("return null when the restaurant does not exist", async () => {
    const result = await repository.search(faker.string.uuid());

    expect(result).toBeNull();
  });
});
