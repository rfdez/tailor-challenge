import { vi } from "vitest";

import { Restaurant } from "../../../../src/modules/restaurants/domain/Restaurant.js";
import { RestaurantRepository } from "../../../../src/modules/restaurants/domain/RestaurantRepository.js";

export class MockRestaurantRepository implements RestaurantRepository {
  private readonly mockSave = vi.fn();
  private readonly mockSearchAll = vi.fn();
  private readonly mockSearch = vi.fn();

  async save(restaurant: Restaurant): Promise<void> {
    this.mockSave(restaurant);
  }

  async searchAll(): Promise<Restaurant[]> {
    return this.mockSearchAll();
  }

  async search(id: string): Promise<Restaurant | null> {
    return this.mockSearch(id);
  }

  shouldSearchAllReturn(restaurants: Restaurant[]): void {
    this.mockSearchAll.mockReturnValueOnce(restaurants);
  }

  shouldSearchReturn(restaurant: Restaurant | null): void {
    this.mockSearch.mockReturnValueOnce(restaurant);
  }
}
