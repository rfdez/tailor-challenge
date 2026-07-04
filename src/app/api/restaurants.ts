import { Hono } from "hono";

import { AllRestaurantsSearcher } from "../../modules/restaurants/application/search-all/AllRestaurantsSearcher.js";
import { InMemoryRestaurantRepository } from "../../modules/restaurants/infrastructure/InMemoryRestaurantRepository.js";

import restaurants from "../../modules/restaurants/infrastructure/data/restaurants.json" with { type: "json" };

const app = new Hono();

const restaurantRepository = new InMemoryRestaurantRepository(restaurants);
const allRestaurantsSearcher = new AllRestaurantsSearcher(restaurantRepository);

app.get("/", async (c) => {
  const restaurants = await allRestaurantsSearcher.searchAll();

  return c.json({ restaurants });
});

export default app;
