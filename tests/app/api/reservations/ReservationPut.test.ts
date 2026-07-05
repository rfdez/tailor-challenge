import crypto from "node:crypto";
import { describe, expect, it } from "vitest";

import app from "../../../../src/app/app.js";

describe("PUT /reservations/:id should", () => {
  it("create a reservation", async () => {
    const id = crypto.randomUUID();
    const body = {
      restaurantId: crypto.randomUUID(),
      date: "2023-12-31",
      time: "19:00",
      partySize: 4,
    };

    const res = await app.request(`/reservations/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
      headers: {
        "x-anonymous-user-id": crypto.randomUUID(),
        "Content-Type": "application/json",
      },
    });

    expect(res.headers.get("Location")).toBe(`/reservations/${id}`);
    expect(res.status).toBe(201);
  });

  it("return 400 if the request body is invalid", async () => {
    const id = crypto.randomUUID();
    const body = {
      restaurantId: crypto.randomUUID(),
      date: "invalid-date",
      time: "19:00",
      partySize: 4,
    };

    const res = await app.request(`/reservations/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
      headers: {
        "x-anonymous-user-id": crypto.randomUUID(),
        "Content-Type": "application/json",
      },
    });

    expect(res.status).toBe(400);
  });

  it("return 401 if the user is not authenticated (when no x-anonymous-user-id header is provided)", async () => {
    const id = crypto.randomUUID();
    const body = {
      restaurantId: crypto.randomUUID(),
      date: "2023-12-31",
      time: "19:00",
      partySize: 4,
    };

    const res = await app.request(`/reservations/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
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
