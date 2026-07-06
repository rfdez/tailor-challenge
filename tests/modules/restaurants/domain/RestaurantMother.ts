import { faker } from "@faker-js/faker";

import {
  Restaurant,
  type RestaurantPrimitives,
} from "../../../../src/modules/restaurants/domain/Restaurant.js";
import { ReservationSettingsMother } from "./ReservationSettingsMother.js";

export class RestaurantMother {
  static create(params?: Partial<RestaurantPrimitives>): Restaurant {
    const primitives: RestaurantPrimitives = {
      id: faker.string.uuid(),
      name: faker.company.name(),
      description: faker.lorem.paragraph(),
      address: faker.location.streetAddress(),
      imageUrl: faker.image.url(),
      coordinates: {
        lat: faker.location.latitude(),
        lng: faker.location.longitude(),
      },
      rating: faker.number.int({ min: 0, max: 5 }),
      commentsCounter: faker.number.int({ min: 0, max: 100 }),
      capacity: faker.number.int({ min: 20, max: 200 }),
      cuisineType: faker.food.ethnicCategory(),
      reservationSettings: ReservationSettingsMother.create().toPrimitives(),
      ...params,
    };

    return Restaurant.fromPrimitives(primitives);
  }

  static multiple(count = 5): Restaurant[] {
    return Array.from({ length: count }, () => this.create());
  }

  static withLunchWindow(): Restaurant {
    return this.create({
      reservationSettings: {
        slotIntervalMinutes: 30,
        defaultSlotCapacity: 8,
        serviceWindows: [{ name: "lunch", start: "13:00", end: "15:00" }],
      },
    });
  }
}
