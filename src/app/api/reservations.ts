import { sValidator } from "@hono/standard-validator";
import { Hono } from "hono";
import * as z from "zod";

import { ReservationCreator } from "../../modules/reservations/application/create/ReservationCreator.js";
import { NegativeOrZeroReservationPartySizeError } from "../../modules/reservations/domain/NegativeOrZeroReservationPartySizeError.js";
import { PastReservationDateError } from "../../modules/reservations/domain/PastReservationDateError.js";
import { InMemoryReservationRepository } from "../../modules/reservations/infrastructure/InMemoryReservationRepository.js";
import { SystemClock } from "../../modules/shared/infrastructure/SystemClock.js";

const app = new Hono();

const createReservationParamSchema = z.object({
  id: z.uuid(),
});

const createReservationBodySchema = z.object({
  restaurantId: z.uuid(),
  date: z.iso.date(),
  time: z.string().regex(/^\d{2}:\d{2}$/), // HH:mm format
  partySize: z.number().int().positive(),
});

const clock = new SystemClock();
const repository = new InMemoryReservationRepository();
const creator = new ReservationCreator(repository, clock);

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
    } catch (error) {
      switch (true) {
        case error instanceof NegativeOrZeroReservationPartySizeError:
        case error instanceof PastReservationDateError:
          return c.json({ error: error.message }, 400);
        default:
          return c.json(null, 500);
      }
    }

    return c.json(null, 201, {
      Location: `/reservations/${id}`,
    });
  },
);

export default app;
