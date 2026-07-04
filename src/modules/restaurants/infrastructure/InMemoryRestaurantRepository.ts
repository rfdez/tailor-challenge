import { Restaurant, type RestaurantPrimitives } from "../domain/Restaurant.js";
import { RestaurantRepository } from "../domain/RestaurantRepository.js";

export class InMemoryRestaurantRepository implements RestaurantRepository {
  constructor(private readonly restaurants: RestaurantPrimitives[]) {}

  async searchAll(): Promise<Restaurant[]> {
    return this.restaurants.map((restaurant) =>
      Restaurant.fromPrimitives(restaurant),
    );
  }
}
