import { Hono } from "hono";
import { describeRoute, validator } from "hono-openapi";
import * as z from "zod";

import { AvailabilitySearcher } from "../../modules/reservations/application/search-availability/AvailabilitySearcher.js";
import { AvailabilityCalculator } from "../../modules/reservations/domain/AvailabilityCalculator.js";
import { PostgresReservationRepository } from "../../modules/reservations/infrastructure/PostgresReservationRepository.js";
import { RestaurantFinder } from "../../modules/restaurants/application/find/RestaurantFinder.js";
import { AllRestaurantsSearcher } from "../../modules/restaurants/application/search-all/AllRestaurantsSearcher.js";
import { RestaurantDoesNotExistError } from "../../modules/restaurants/domain/RestaurantDoesNotExistError.js";
import { PostgresRestaurantRepository } from "../../modules/restaurants/infrastructure/PostgresRestaurantRepository.js";
import { PostgresConnection } from "../../modules/shared/infrastructure/PostgresConnection.js";
import { config } from "../../modules/shared/infrastructure/config.js";

const app = new Hono();

const availabilityParamSchema = z.object({
  id: z.uuid(),
});

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

app.get(
  "/",
  describeRoute({
    tags: ["Restaurants"],
    summary: "Get all restaurants",
    description: "Get all restaurants available in the system",
    responses: {
      200: {
        description: "A list of all restaurants",
      },
    },
  }),
  async (c) => {
    const restaurants = await allRestaurantsSearcher.searchAll();

    return c.json({ restaurants });
  },
);

app.get(
  "/:id/availability",
  describeRoute({
    tags: ["Restaurants"],
    summary: "Get availability for a specific restaurant",
    description:
      "Get availability for a specific restaurant on a specific date and party size",
    responses: {
      200: {
        description:
          "A list of available slots for the specified restaurant, date, and party size",
      },
      400: {
        description: "Invalid query parameters",
      },
      404: {
        description: "Restaurant not found",
      },
    },
  }),
  validator("param", availabilityParamSchema),
  validator("query", availabilityQuerySchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const { date, partySize } = c.req.valid("query");

    try {
      const slots = await availabilitySearcher.search(id, date, partySize);

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
