import { Hono } from "hono";

import { AllRestaurantsSearcher } from "../../modules/restaurants/application/search-all/AllRestaurantsSearcher.js";
import { PostgresRestaurantRepository } from "../../modules/restaurants/infrastructure/PostgresRestaurantRepository.js";
import { PostgresConnectionFactory } from "../../modules/shared/infrastructure/PostgresConnectionFactory.js";

const app = new Hono();

const connection = PostgresConnectionFactory.create();
const repository = new PostgresRestaurantRepository(connection);
const allRestaurantsSearcher = new AllRestaurantsSearcher(repository);

app.get("/", async (c) => {
  const restaurants = await allRestaurantsSearcher.searchAll();

  return c.json({ restaurants });
});

export default app;
