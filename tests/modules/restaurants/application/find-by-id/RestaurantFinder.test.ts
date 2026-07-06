import { describe, expect, it } from "vitest";

import { faker } from "@faker-js/faker";

import { RestaurantFinder } from "../../../../../src/modules/restaurants/application/find/RestaurantFinder.js";
import { RestaurantDoesNotExistError } from "../../../../../src/modules/restaurants/domain/RestaurantDoesNotExistError.js";
import { RestaurantMother } from "../../domain/RestaurantMother.js";
import { MockRestaurantRepository } from "../../infrastructure/MockRestaurantRepository.js";

describe("RestaurantFinder should", { tags: "ci" }, () => {
  const repository = new MockRestaurantRepository();
  const finder = new RestaurantFinder(repository);

  it("find a restaurant by id", async () => {
    const restaurant = RestaurantMother.create();
    const primitives = restaurant.toPrimitives();

    repository.shouldSearchReturn(restaurant);

    const result = await finder.find(primitives.id);

    expect(result).toEqual(primitives);
  });

  it("throw RestaurantDoesNotExistError when the restaurant does not exist", async () => {
    const id = faker.string.uuid();

    repository.shouldSearchReturn(null);

    await expect(finder.find(id)).rejects.toThrow(RestaurantDoesNotExistError);
  });
});
