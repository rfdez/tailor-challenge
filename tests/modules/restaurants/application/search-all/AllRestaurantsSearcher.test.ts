import { describe, expect, it } from "vitest";

import { AllRestaurantsSearcher } from "../../../../../src/modules/restaurants/application/search-all/AllRestaurantsSearcher.js";
import { RestaurantMother } from "../../domain/RestaurantMother.js";
import { MockRestaurantRepository } from "../../infrastructure/MockRestaurantRepository.js";

describe("AllRestaurantsSearcher should", { tags: "ci" }, () => {
  const repository = new MockRestaurantRepository();
  const searcher = new AllRestaurantsSearcher(repository);

  it("return all restaurants", async () => {
    const restaurants = RestaurantMother.multiple(3);

    repository.shouldSearchAllReturn(restaurants);

    const result = await searcher.searchAll();

    expect(result).toEqual(
      restaurants.map((restaurant) => restaurant.toPrimitives()),
    );
  });
});
