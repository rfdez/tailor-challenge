import { vi } from "vitest";

import { Restaurant } from "../../../../src/modules/restaurants/domain/Restaurant.js";
import { RestaurantRepository } from "../../../../src/modules/restaurants/domain/RestaurantRepository.js";

export class MockRestaurantRepository implements RestaurantRepository {
  private readonly mockSearchAll = vi.fn();

  async searchAll(): Promise<Restaurant[]> {
    return this.mockSearchAll();
  }

  shouldSearchAllReturn(restaurants: Restaurant[]): void {
    this.mockSearchAll.mockReturnValueOnce(restaurants);
  }
}
