import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { PostgresRestaurantRepository } from "../../../../src/modules/restaurants/infrastructure/PostgresRestaurantRepository.js";
import { PostgresConnectionFactory } from "../../../../src/modules/shared/infrastructure/PostgresConnectionFactory.js";
import { RestaurantMother } from "../domain/RestaurantMother.js";

describe("PostgresRestaurantRepository should", () => {
  const connection = PostgresConnectionFactory.create();
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
});
