import { describe, expect, it } from "vitest";

import app from "../../../../src/app/app.js";
import { ReservationMother } from "../../../modules/reservations/domain/ReservationMother.js";

describe("PUT /reservations/:id should", () => {
  it("create a reservation", async () => {
    const reservation = ReservationMother.create();
    const primitives = reservation.toPrimitives();

    const res = await app.request(`/reservations/${primitives.id}`, {
      method: "PUT",
      body: JSON.stringify({
        restaurantId: primitives.restaurantId,
        date: primitives.date,
        time: primitives.time,
        partySize: primitives.partySize,
      }),
      headers: {
        "x-anonymous-user-id": primitives.userId,
        "Content-Type": "application/json",
      },
    });

    expect(res.headers.get("Location")).toBe(`/reservations/${primitives.id}`);
    expect(res.status).toBe(201);
  });

  it("return 400 if the request body is invalid", async () => {
    const reservation = ReservationMother.create();
    const primitives = reservation.toPrimitives();

    const res = await app.request(`/reservations/${primitives.id}`, {
      method: "PUT",
      body: JSON.stringify({
        restaurantId: primitives.restaurantId,
        date: "invalid-date",
        time: primitives.time,
        partySize: primitives.partySize,
      }),
      headers: {
        "x-anonymous-user-id": primitives.userId,
        "Content-Type": "application/json",
      },
    });

    expect(res.status).toBe(400);
  });

  it("return 401 if the user is not authenticated (when no x-anonymous-user-id header is provided)", async () => {
    const reservation = ReservationMother.create();
    const primitives = reservation.toPrimitives();

    const res = await app.request(`/reservations/${primitives.id}`, {
      method: "PUT",
      body: JSON.stringify({
        restaurantId: primitives.restaurantId,
        date: primitives.date,
        time: primitives.time,
        partySize: primitives.partySize,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    expect(res.headers.get("WWW-Authenticate")).toBe(
      'Bearer realm="Access to the reservations API"',
    );
    expect(res.status).toBe(401);
  });
});
