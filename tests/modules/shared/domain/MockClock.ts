import { vi } from "vitest";

import { Clock } from "../../../../src/modules/shared/domain/Clock.js";

export class MockClock implements Clock {
  private readonly mockNow = vi.fn();

  now(): Date {
    return this.mockNow();
  }

  shouldGenerate(date: Date): void {
    this.mockNow.mockReturnValueOnce(date);
  }
}
