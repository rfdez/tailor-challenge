import { faker } from "@faker-js/faker";

import {
  Reservation,
  type ReservationPrimitives,
} from "../../../../src/modules/reservations/domain/Reservation.js";

export class ReservationMother {
  static create(params?: Partial<ReservationPrimitives>): Reservation {
    const primitives: ReservationPrimitives = {
      id: faker.string.uuid(),
      restaurantId: faker.string.uuid(),
      userId: faker.string.uuid(),
      date: faker.date.soon().toISOString().split("T")[0] ?? "",
      time:
        faker.date.soon().toISOString().split("T")[1]?.substring(0, 5) ?? "",
      partySize: faker.number.int({ min: 1, max: 10 }),
      status: faker.helpers.arrayElement(["confirmed", "cancelled"]),
      ...params,
    };

    return Reservation.fromPrimitives(primitives);
  }

  static confirmed(): Reservation {
    return this.create({ status: "confirmed" });
  }
}
