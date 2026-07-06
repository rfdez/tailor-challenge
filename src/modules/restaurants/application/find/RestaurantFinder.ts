import type { RestaurantPrimitives } from "../../domain/Restaurant.js";
import { RestaurantDoesNotExistError } from "../../domain/RestaurantDoesNotExistError.js";
import { RestaurantRepository } from "../../domain/RestaurantRepository.js";

export class RestaurantFinder {
  constructor(private readonly repository: RestaurantRepository) {}

  async find(id: string): Promise<RestaurantPrimitives> {
    const restaurant = await this.repository.search(id);

    if (!restaurant) {
      throw new RestaurantDoesNotExistError(id);
    }

    return restaurant.toPrimitives();
  }
}
