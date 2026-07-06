import type { ReservationSettingsPrimitives } from "../../restaurants/domain/ReservationSettings.js";
import type { ReservationPrimitives } from "./Reservation.js";
import type { Slot } from "./Slot.js";

function parseTimeToMinutes(time: string): number {
  const parts = time.split(":").map(Number);

  return (parts[0] ?? 0) * 60 + (parts[1] ?? 0);
}

function formatMinutesToTime(minutes: number): string {
  const hours = String(Math.floor(minutes / 60)).padStart(2, "0");
  const mins = String(minutes % 60).padStart(2, "0");

  return `${hours}:${mins}`;
}

export class AvailabilityCalculator {
  calculate(
    settings: ReservationSettingsPrimitives,
    date: string,
    reservations: ReservationPrimitives[],
    partySize: number,
  ): Slot[] {
    const confirmed: ReservationPrimitives[] = reservations.filter(
      (r) => r.status === "confirmed",
    );

    const slots: Slot[] = [];

    for (const window of settings.serviceWindows) {
      const startMin = parseTimeToMinutes(window.start);
      const endMin = parseTimeToMinutes(window.end);

      for (let t = startMin; t < endMin; t += settings.slotIntervalMinutes) {
        const time = formatMinutesToTime(t);
        const reservedSeats = confirmed
          .filter((r) => r.date === date && r.time === time)
          .reduce((sum, r) => sum + r.partySize, 0);

        const availableSeats = Math.max(
          0,
          settings.defaultSlotCapacity - reservedSeats,
        );

        slots.push({
          time,
          capacity: settings.defaultSlotCapacity,
          reservedSeats,
          availableSeats,
          available: availableSeats >= partySize,
        });
      }
    }

    return slots;
  }
}
