import { describe, expect, it } from "vitest";

import { AvailabilityCalculator } from "../../../../src/modules/reservations/domain/AvailabilityCalculator.js";
import { ReservationMother } from "../../reservations/domain/ReservationMother.js";
import { ReservationSettingsMother } from "../../restaurants/domain/ReservationSettingsMother.js";

describe("AvailabilityCalculator should", { tags: "ci" }, () => {
  const calculator = new AvailabilityCalculator();

  it("generate correct slots for lunch window (13:00-15:00, 30min intervals)", () => {
    const settings = ReservationSettingsMother.create({
      slotIntervalMinutes: 30,
      serviceWindows: [{ name: "lunch", start: "13:00", end: "15:00" }],
    });

    const slots = calculator.calculate(
      settings.toPrimitives(),
      "2026-07-10",
      [],
      4,
    );

    expect(slots).toHaveLength(4);

    const times = slots.map((s) => s.time);
    expect(times).toEqual(["13:00", "13:30", "14:00", "14:30"]);
  });

  it("generate correct slots for dinner window (20:00-23:00, 30min intervals)", () => {
    const settings = ReservationSettingsMother.create({
      slotIntervalMinutes: 30,
      serviceWindows: [{ name: "dinner", start: "20:00", end: "23:00" }],
    });

    const slots = calculator.calculate(
      settings.toPrimitives(),
      "2026-07-10",
      [],
      4,
    );

    expect(slots).toHaveLength(6);

    const times = slots.map((s) => s.time);
    expect(times).toEqual([
      "20:00",
      "20:30",
      "21:00",
      "21:30",
      "22:00",
      "22:30",
    ]);
  });

  it("generate slots for both lunch and dinner in order", () => {
    const settings = ReservationSettingsMother.create({
      slotIntervalMinutes: 30,
      serviceWindows: [
        { name: "lunch", start: "13:00", end: "15:00" },
        { name: "dinner", start: "20:00", end: "23:00" },
      ],
    });

    const slots = calculator.calculate(
      settings.toPrimitives(),
      "2026-07-10",
      [],
      4,
    );

    expect(slots).toHaveLength(10);

    const times = slots.map((s) => s.time);
    expect(times[0]).toBe("13:00");
    expect(times[3]).toBe("14:30");
    expect(times[4]).toBe("20:00");
    expect(times[9]).toBe("22:30");
  });

  it("respect start inclusive and end exclusive", () => {
    const settings = ReservationSettingsMother.create({
      slotIntervalMinutes: 30,
      serviceWindows: [{ name: "lunch", start: "13:00", end: "15:00" }],
    });

    const slots = calculator.calculate(
      settings.toPrimitives(),
      "2026-07-10",
      [],
      4,
    );
    const times = slots.map((s) => s.time);

    expect(times).toContain("13:00");
    expect(times).not.toContain("15:00");
  });

  it("use defaultSlotCapacity as capacity for every slot", () => {
    const settings = ReservationSettingsMother.create({
      defaultSlotCapacity: 12,
    });

    const slots = calculator.calculate(
      settings.toPrimitives(),
      "2026-07-10",
      [],
      4,
    );

    for (const slot of slots) {
      expect(slot.capacity).toBe(settings.toPrimitives().defaultSlotCapacity);
    }
  });

  it("respect custom slot interval", () => {
    const settings = ReservationSettingsMother.create({
      slotIntervalMinutes: 60,
      serviceWindows: [
        { name: "lunch", start: "13:00", end: "15:00" },
        { name: "dinner", start: "20:00", end: "23:00" },
      ],
    });

    const slots = calculator.calculate(
      settings.toPrimitives(),
      "2026-07-10",
      [],
      4,
    );

    const times = slots.map((s) => s.time);
    expect(times).toEqual(["13:00", "14:00", "20:00", "21:00", "22:00"]);
  });

  it("show full capacity when there are no reservations", () => {
    const settings = ReservationSettingsMother.create({
      slotIntervalMinutes: 30,
      serviceWindows: [{ name: "lunch", start: "13:00", end: "15:00" }],
      defaultSlotCapacity: 8,
    });

    const slots = calculator.calculate(
      settings.toPrimitives(),
      "2026-07-10",
      [],
      4,
    );

    for (const slot of slots) {
      expect(slot.reservedSeats).toBe(0);
      expect(slot.availableSeats).toBe(slot.capacity);
      expect(slot.available).toBe(true);
    }
  });

  it("subtract confirmed reservations from available seats", () => {
    const settings = ReservationSettingsMother.create({
      slotIntervalMinutes: 30,
      serviceWindows: [{ name: "lunch", start: "13:00", end: "15:00" }],
      defaultSlotCapacity: 8,
    });

    const slots = calculator.calculate(
      settings.toPrimitives(),
      "2026-07-10",
      [ReservationMother.confirmedAt("2026-07-10", "13:00", 3).toPrimitives()],
      4,
    );

    const slot = slots.find((s) => s.time === "13:00");
    expect(slot?.reservedSeats).toBe(3);
    expect(slot?.availableSeats).toBe(5);
    expect(slot?.available).toBe(true);
  });

  it("sum multiple confirmed reservations for the same slot", () => {
    const settings = ReservationSettingsMother.create({
      slotIntervalMinutes: 30,
      serviceWindows: [{ name: "lunch", start: "13:00", end: "15:00" }],
      defaultSlotCapacity: 8,
    });

    const slots = calculator.calculate(
      settings.toPrimitives(),
      "2026-07-10",
      [
        ReservationMother.confirmedAt("2026-07-10", "13:00", 3).toPrimitives(),
        ReservationMother.confirmedAt("2026-07-10", "13:00", 2).toPrimitives(),
      ],
      4,
    );

    const slot = slots.find((s) => s.time === "13:00");
    expect(slot?.reservedSeats).toBe(5);
    expect(slot?.availableSeats).toBe(3);
  });

  it("exclude cancelled reservations from reserved seats", () => {
    const settings = ReservationSettingsMother.create({
      slotIntervalMinutes: 30,
      serviceWindows: [{ name: "lunch", start: "13:00", end: "15:00" }],
      defaultSlotCapacity: 8,
    });

    const slots = calculator.calculate(
      settings.toPrimitives(),
      "2026-07-10",
      [
        ReservationMother.confirmedAt("2026-07-10", "13:00", 3).toPrimitives(),
        ReservationMother.cancelledAt("2026-07-10", "13:00", 5).toPrimitives(),
      ],
      4,
    );

    const slot = slots.find((s) => s.time === "13:00");
    expect(slot?.reservedSeats).toBe(3);
  });

  it("mark a fully booked slot as not available", () => {
    const settings = ReservationSettingsMother.create({
      slotIntervalMinutes: 30,
      serviceWindows: [{ name: "lunch", start: "13:00", end: "15:00" }],
      defaultSlotCapacity: 8,
    });

    const slots = calculator.calculate(
      settings.toPrimitives(),
      "2026-07-10",
      [ReservationMother.confirmedAt("2026-07-10", "13:00", 8).toPrimitives()],
      4,
    );

    const slot = slots.find((s) => s.time === "13:00");
    expect(slot?.reservedSeats).toBe(8);
    expect(slot?.availableSeats).toBe(0);
    expect(slot?.available).toBe(false);
  });

  it("mark a slot as not available when party size exceeds available seats", () => {
    const settings = ReservationSettingsMother.create({
      slotIntervalMinutes: 30,
      serviceWindows: [{ name: "lunch", start: "13:00", end: "15:00" }],
      defaultSlotCapacity: 8,
    });

    const slots = calculator.calculate(
      settings.toPrimitives(),
      "2026-07-10",
      [ReservationMother.confirmedAt("2026-07-10", "13:00", 3).toPrimitives()],
      6,
    );

    const slot = slots.find((s) => s.time === "13:00");
    expect(slot?.availableSeats).toBe(5);
    expect(slot?.available).toBe(false);
  });

  it("mark a slot as available when party size fits exactly", () => {
    const settings = ReservationSettingsMother.create({
      slotIntervalMinutes: 30,
      serviceWindows: [{ name: "lunch", start: "13:00", end: "15:00" }],
      defaultSlotCapacity: 8,
    });

    const slots = calculator.calculate(
      settings.toPrimitives(),
      "2026-07-10",
      [ReservationMother.confirmedAt("2026-07-10", "13:00", 3).toPrimitives()],
      5,
    );

    const slot = slots.find((s) => s.time === "13:00");
    expect(slot?.availableSeats).toBe(5);
    expect(slot?.available).toBe(true);
  });

  it("ignore reservations for a different date", () => {
    const settings = ReservationSettingsMother.create({
      slotIntervalMinutes: 30,
      serviceWindows: [{ name: "lunch", start: "13:00", end: "15:00" }],
      defaultSlotCapacity: 8,
    });

    const slots = calculator.calculate(
      settings.toPrimitives(),
      "2026-07-10",
      [ReservationMother.confirmedAt("2026-07-11", "13:00", 8).toPrimitives()],
      4,
    );

    const slot = slots.find((s) => s.time === "13:00");
    expect(slot?.reservedSeats).toBe(0);
    expect(slot?.availableSeats).toBe(8);
    expect(slot?.available).toBe(true);
  });
});
