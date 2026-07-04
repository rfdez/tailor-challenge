import { faker } from "@faker-js/faker";

import {
  Restaurant,
  type RestaurantPrimitives,
} from "../../../../src/modules/restaurants/domain/Restaurant.js";

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
      ...params,
    };

    return Restaurant.fromPrimitives(primitives);
  }

  static multiple(count = 5): Restaurant[] {
    return Array.from({ length: count }, () => this.create());
  }
}
