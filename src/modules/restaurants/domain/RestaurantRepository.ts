import { Restaurant } from "./Restaurant.js";

export abstract class RestaurantRepository {
  abstract searchAll(): Promise<Restaurant[]>;
}
