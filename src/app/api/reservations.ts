import { sValidator } from "@hono/standard-validator";
import { Hono } from "hono";
import * as z from "zod";

import { ReservationCreator } from "../../modules/reservations/application/create/ReservationCreator.js";
import { AvailabilityCalculator } from "../../modules/reservations/domain/AvailabilityCalculator.js";
import { InsufficientAvailableSeatsError } from "../../modules/reservations/domain/InsufficientAvailableSeatsError.js";
import { InvalidReservationTimeError } from "../../modules/reservations/domain/InvalidReservationTimeError.js";
import { NegativeOrZeroReservationPartySizeError } from "../../modules/reservations/domain/NegativeOrZeroReservationPartySizeError.js";
import { PastReservationDateError } from "../../modules/reservations/domain/PastReservationDateError.js";
import { PostgresReservationRepository } from "../../modules/reservations/infrastructure/PostgresReservationRepository.js";
import { RestaurantFinder } from "../../modules/restaurants/application/find/RestaurantFinder.js";
import { RestaurantDoesNotExistError } from "../../modules/restaurants/domain/RestaurantDoesNotExistError.js";
import { PostgresRestaurantRepository } from "../../modules/restaurants/infrastructure/PostgresRestaurantRepository.js";
import { PostgresConnection } from "../../modules/shared/infrastructure/PostgresConnection.js";
import { SystemClock } from "../../modules/shared/infrastructure/SystemClock.js";
import { config } from "../../modules/shared/infrastructure/config.js";

const app = new Hono();

const createReservationParamSchema = z.object({
  id: z.uuid(),
});

const createReservationBodySchema = z.object({
  restaurantId: z.uuid(),
  date: z.iso.date(),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  partySize: z.number().int().positive(),
});

const clock = new SystemClock();
const connection = new PostgresConnection(config.postgres.url);
const reservationRepository = new PostgresReservationRepository(connection);
const restaurantRepository = new PostgresRestaurantRepository(connection);
const restaurantFinder = new RestaurantFinder(restaurantRepository);
const calculator = new AvailabilityCalculator();
const creator = new ReservationCreator(
  reservationRepository,
  restaurantFinder,
  calculator,
  clock,
);

app.put(
  "/:id",
  sValidator("param", createReservationParamSchema),
  sValidator("json", createReservationBodySchema),
  async (c) => {
    const userId = c.req.header("x-anonymous-user-id");
    if (!userId) {
      return c.json(null, 401, {
        "WWW-Authenticate": 'Bearer realm="Access to the reservations API"',
      });
    }

    const { id } = c.req.valid("param");
    const { restaurantId, date, time, partySize } = c.req.valid("json");

    try {
      await creator.create(id, restaurantId, userId, date, time, partySize);

      return c.json(null, 201, {
        Location: `/reservations/${id}`,
      });
    } catch (error) {
      switch (true) {
        case error instanceof NegativeOrZeroReservationPartySizeError:
        case error instanceof PastReservationDateError:
        case error instanceof InvalidReservationTimeError:
        case error instanceof InsufficientAvailableSeatsError:
          return c.json({ error: error.message }, 400);
        case error instanceof RestaurantDoesNotExistError:
          return c.json({ error: error.message }, 404);
        default:
          return c.json(null, 500);
      }
    }
  },
);

export default app;
