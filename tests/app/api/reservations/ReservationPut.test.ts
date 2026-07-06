import { faker } from "@faker-js/faker";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import app from "../../../../src/app/app.js";
import { PostgresRestaurantRepository } from "../../../../src/modules/restaurants/infrastructure/PostgresRestaurantRepository.js";
import { PostgresReservationRepository } from "../../../../src/modules/reservations/infrastructure/PostgresReservationRepository.js";
import { config } from "../../../../src/modules/shared/infrastructure/config.js";
import { PostgresConnection } from "../../../../src/modules/shared/infrastructure/PostgresConnection.js";
import { RestaurantMother } from "../../../modules/restaurants/domain/RestaurantMother.js";
import { ReservationMother } from "../../../modules/reservations/domain/ReservationMother.js";

describe("PUT /reservations/:id should", () => {
  const connection = new PostgresConnection(config.postgres.url);
  const restaurantRepository = new PostgresRestaurantRepository(connection);
  const reservationRepository = new PostgresReservationRepository(connection);

  beforeAll(async () => {
    await connection.truncateAll();
  });

  afterAll(async () => {
    await connection.end();
  });

  it("create a reservation", async () => {
    const restaurant = RestaurantMother.withLunchWindow();
    const restaurantId = restaurant.toPrimitives().id;
    const id = faker.string.uuid();
    const userId = faker.string.uuid();

    await restaurantRepository.save(restaurant);

    const res = await app.request(`/reservations/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        restaurantId,
        date: "2026-07-10",
        time: "13:00",
        partySize: 4,
      }),
      headers: {
        "x-anonymous-user-id": userId,
        "Content-Type": "application/json",
      },
    });

    expect(res.status).toBe(201);
    expect(res.headers.get("Location")).toBe(`/reservations/${id}`);
  });

  it("return 400 if the request body is invalid", async () => {
    const res = await app.request(`/reservations/${faker.string.uuid()}`, {
      method: "PUT",
      body: JSON.stringify({
        restaurantId: faker.string.uuid(),
        date: "invalid-date",
        time: "13:00",
        partySize: 4,
      }),
      headers: {
        "x-anonymous-user-id": faker.string.uuid(),
        "Content-Type": "application/json",
      },
    });

    expect(res.status).toBe(400);
  });

  it("return 401 if the user is not authenticated", async () => {
    const res = await app.request(`/reservations/${faker.string.uuid()}`, {
      method: "PUT",
      body: JSON.stringify({
        restaurantId: faker.string.uuid(),
        date: "2026-07-10",
        time: "13:00",
        partySize: 4,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    expect(res.status).toBe(401);
  });

  it("return 404 when the restaurant does not exist", async () => {
    const res = await app.request(`/reservations/${faker.string.uuid()}`, {
      method: "PUT",
      body: JSON.stringify({
        restaurantId: faker.string.uuid(),
        date: "2026-07-10",
        time: "13:00",
        partySize: 4,
      }),
      headers: {
        "x-anonymous-user-id": faker.string.uuid(),
        "Content-Type": "application/json",
      },
    });

    expect(res.status).toBe(404);
  });

  it("return 400 when the time does not match a generated slot", async () => {
    const restaurant = RestaurantMother.withLunchWindow();
    const restaurantId = restaurant.toPrimitives().id;

    await restaurantRepository.save(restaurant);

    const res = await app.request(`/reservations/${faker.string.uuid()}`, {
      method: "PUT",
      body: JSON.stringify({
        restaurantId,
        date: "2026-07-10",
        time: "18:00",
        partySize: 4,
      }),
      headers: {
        "x-anonymous-user-id": faker.string.uuid(),
        "Content-Type": "application/json",
      },
    });

    expect(res.status).toBe(400);
  });

  it("return 400 when there are not enough available seats", async () => {
    const restaurant = RestaurantMother.withLunchWindow();
    const restaurantId = restaurant.toPrimitives().id;

    await restaurantRepository.save(restaurant);

    const existing = ReservationMother.create({
      restaurantId,
      date: "2026-07-10",
      time: "13:00",
      partySize: 8,
      status: "confirmed",
    });
    await reservationRepository.save(existing);

    const res = await app.request(`/reservations/${faker.string.uuid()}`, {
      method: "PUT",
      body: JSON.stringify({
        restaurantId,
        date: "2026-07-10",
        time: "13:00",
        partySize: 4,
      }),
      headers: {
        "x-anonymous-user-id": faker.string.uuid(),
        "Content-Type": "application/json",
      },
    });

    expect(res.status).toBe(400);
  });
});
