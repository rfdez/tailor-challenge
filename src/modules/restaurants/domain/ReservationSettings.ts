export interface ServiceWindow {
  name: string;
  start: string;
  end: string;
}

export interface ReservationSettingsPrimitives {
  slotIntervalMinutes: number;
  defaultSlotCapacity: number;
  serviceWindows: ServiceWindow[];
}

export class ReservationSettings {
  constructor(
    private readonly slotIntervalMinutes: number,
    private readonly defaultSlotCapacity: number,
    private readonly serviceWindows: ServiceWindow[],
  ) {}

  static fromPrimitives(
    primitives: ReservationSettingsPrimitives,
  ): ReservationSettings {
    return new ReservationSettings(
      primitives.slotIntervalMinutes,
      primitives.defaultSlotCapacity,
      primitives.serviceWindows,
    );
  }

  toPrimitives(): ReservationSettingsPrimitives {
    return {
      slotIntervalMinutes: this.slotIntervalMinutes,
      defaultSlotCapacity: this.defaultSlotCapacity,
      serviceWindows: this.serviceWindows,
    };
  }
}
