import { Clock } from "../../shared/domain/Clock.js";
import { NegativeOrZeroReservationPartySizeError } from "./NegativeOrZeroReservationPartySizeError.js";
import { PastReservationDateError } from "./PastReservationDateError.js";

export type ReservationStatus = "confirmed" | "cancelled";

export interface ReservationPrimitives {
  id: string;
  restaurantId: string;
  userId: string;
  date: string;
  time: string;
  partySize: number;
  status: ReservationStatus;
}

export class Reservation {
  constructor(
    private readonly id: string,
    private readonly restaurantId: string,
    private readonly userId: string,
    private readonly date: string,
    private readonly time: string,
    private readonly partySize: number,
    private readonly status: ReservationStatus,
  ) {}

  static create(
    id: string,
    restaurantId: string,
    userId: string,
    date: string,
    time: string,
    partySize: number,
    clock: Clock,
  ): Reservation {
    if (partySize <= 0) {
      throw new NegativeOrZeroReservationPartySizeError(partySize);
    }

    if (new Date(`${date}T${time}`) < clock.now()) {
      throw new PastReservationDateError(`${date}T${time}`);
    }

    return new Reservation(
      id,
      restaurantId,
      userId,
      date,
      time,
      partySize,
      "confirmed",
    );
  }

  static fromPrimitives(primitives: ReservationPrimitives): Reservation {
    return new Reservation(
      primitives.id,
      primitives.restaurantId,
      primitives.userId,
      primitives.date,
      primitives.time,
      primitives.partySize,
      primitives.status,
    );
  }

  toPrimitives(): ReservationPrimitives {
    return {
      id: this.id,
      restaurantId: this.restaurantId,
      userId: this.userId,
      date: this.date,
      time: this.time,
      partySize: this.partySize,
      status: this.status,
    };
  }
}
