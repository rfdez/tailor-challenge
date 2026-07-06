import { sValidator } from "@hono/standard-validator";
import { Hono } from "hono";
import * as z from "zod";

import { RestaurantFinder } from "../../modules/restaurants/application/find/RestaurantFinder.js";
import { AllRestaurantsSearcher } from "../../modules/restaurants/application/search-all/AllRestaurantsSearcher.js";
import { RestaurantDoesNotExistError } from "../../modules/restaurants/domain/RestaurantDoesNotExistError.js";
import { PostgresRestaurantRepository } from "../../modules/restaurants/infrastructure/PostgresRestaurantRepository.js";
import { AvailabilitySearcher } from "../../modules/reservations/application/search-availability/AvailabilitySearcher.js";
import { AvailabilityCalculator } from "../../modules/reservations/domain/AvailabilityCalculator.js";
import { PostgresReservationRepository } from "../../modules/reservations/infrastructure/PostgresReservationRepository.js";
import { PostgresConnection } from "../../modules/shared/infrastructure/PostgresConnection.js";
import { config } from "../../modules/shared/infrastructure/config.js";

const app = new Hono();

const availabilityQuerySchema = z.object({
  date: z.iso.date(),
  partySize: z.coerce.number().int().positive(),
});

const connection = new PostgresConnection(config.postgres.url);
const restaurantRepository = new PostgresRestaurantRepository(connection);
const allRestaurantsSearcher = new AllRestaurantsSearcher(restaurantRepository);
const restaurantFinder = new RestaurantFinder(restaurantRepository);
const reservationRepository = new PostgresReservationRepository(connection);
const availabilitySearcher = new AvailabilitySearcher(
  restaurantFinder,
  reservationRepository,
  new AvailabilityCalculator(),
);

app.get("/", async (c) => {
  const restaurants = await allRestaurantsSearcher.searchAll();

  return c.json({ restaurants });
});

app.get(
  "/:restaurantId/availability",
  sValidator("query", availabilityQuerySchema),
  async (c) => {
    const { restaurantId } = c.req.param();
    const { date, partySize } = c.req.valid("query");

    try {
      const slots = await availabilitySearcher.search(
        restaurantId,
        date,
        partySize,
      );

      return c.json({ slots });
    } catch (error) {
      if (error instanceof RestaurantDoesNotExistError) {
        return c.json({ error: error.message }, 404);
      }

      return c.json(null, 500);
    }
  },
);

export default app;
