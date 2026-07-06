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
      date:
        faker.date
          .soon({
            days: {
              min: 1,
              max: 30,
            },
          })
          .toISOString()
          .split("T")[0] ?? "",
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

  static confirmedWithRestaurantAndDate(
    restaurantId: string,
    date: string,
  ): Reservation {
    return this.create({ status: "confirmed", restaurantId, date });
  }

  static multiple(count = 5): Reservation[] {
    return Array.from({ length: count }, () => this.create());
  }

  static confirmedAt(
    date: string,
    time: string,
    partySize: number,
  ): Reservation {
    return this.create({ date, time, partySize, status: "confirmed" });
  }

  static cancelledAt(
    date: string,
    time: string,
    partySize: number,
  ): Reservation {
    return this.create({ date, time, partySize, status: "cancelled" });
  }
}
