import { faker } from "@faker-js/faker";

import {
  ReservationSettings,
  type ReservationSettingsPrimitives,
} from "../../../../src/modules/restaurants/domain/ReservationSettings.js";

export class ReservationSettingsMother {
  static create(
    params?: Partial<ReservationSettingsPrimitives>,
  ): ReservationSettings {
    return ReservationSettings.fromPrimitives({
      slotIntervalMinutes: faker.helpers.arrayElement([15, 30, 60]),
      defaultSlotCapacity: faker.number.int({ min: 4, max: 12 }),
      serviceWindows: faker.helpers.arrayElement([
        [
          { name: "lunch", start: "13:00", end: "15:00" },
          { name: "dinner", start: "20:00", end: "23:00" },
        ],
        [
          { name: "lunch", start: "12:00", end: "16:00" },
          { name: "dinner", start: "19:00", end: "22:00" },
        ],
      ]),
      ...params,
    });
  }
}
