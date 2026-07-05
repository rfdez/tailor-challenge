import { sValidator } from "@hono/standard-validator";
import { Hono } from "hono";
import * as z from "zod";

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

    console.log("Reservation:", {
      id,
      restaurantId,
      userId,
      date,
      time,
      partySize,
    });

    return c.json(null, 201, {
      Location: `/reservations/${id}`,
    });
  },
);

export default app;
