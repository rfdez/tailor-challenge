import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type { ReservationPrimitives } from "../../src/modules/reservations/domain/Reservation.js";
import { Reservation } from "../../src/modules/reservations/domain/Reservation.js";
import { PostgresReservationRepository } from "../../src/modules/reservations/infrastructure/PostgresReservationRepository.js";
import type { RestaurantPrimitives } from "../../src/modules/restaurants/domain/Restaurant.js";
import { Restaurant } from "../../src/modules/restaurants/domain/Restaurant.js";
import { PostgresRestaurantRepository } from "../../src/modules/restaurants/infrastructure/PostgresRestaurantRepository.js";
import { config } from "../../src/modules/shared/infrastructure/config.js";
import { PostgresConnection } from "../../src/modules/shared/infrastructure/PostgresConnection.js";

interface SeedData {
  seedUserId: string;
  restaurants: RestaurantPrimitives[];
  reservations: ReservationPrimitives[];
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dataPath = resolve(__dirname, "data.json");
const data = JSON.parse(readFileSync(dataPath, "utf-8")) as SeedData;

const connection = new PostgresConnection(config.postgres.url);
const restaurantRepository = new PostgresRestaurantRepository(connection);
const reservationRepository = new PostgresReservationRepository(connection);

console.log("Seeding restaurants...");
for (const restaurantPrimitives of data.restaurants) {
  const restaurant = Restaurant.fromPrimitives(restaurantPrimitives);
  await restaurantRepository.save(restaurant);
  console.log(`  ${restaurantPrimitives.name}`);
}

console.log("Seeding reservations...");
for (const reservationPrimitives of data.reservations) {
  const reservation = Reservation.fromPrimitives(reservationPrimitives);
  await reservationRepository.save(reservation);
  console.log(
    `  ${reservationPrimitives.id} -> ${reservationPrimitives.restaurantId} on ${reservationPrimitives.date} at ${reservationPrimitives.time}`,
  );
}

await connection.end();
console.log("Seed completed.");
