import { Restaurant } from "./Restaurant.js";

export abstract class RestaurantRepository {
  abstract save(restaurant: Restaurant): Promise<void>;
  abstract searchAll(): Promise<Restaurant[]>;
}
