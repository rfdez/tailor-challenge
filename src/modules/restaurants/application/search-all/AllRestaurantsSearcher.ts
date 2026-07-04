import type { RestaurantPrimitives } from "../../domain/Restaurant.js";
import { RestaurantRepository } from "../../domain/RestaurantRepository.js";

export class AllRestaurantsSearcher {
  constructor(private readonly repository: RestaurantRepository) {}

  async searchAll(): Promise<RestaurantPrimitives[]> {
    const restaurants = await this.repository.searchAll();

    return restaurants.map((restaurant) => restaurant.toPrimitives());
  }
}
