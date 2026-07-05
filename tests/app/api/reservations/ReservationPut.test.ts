import { describe, expect, it } from "vitest";

import app from "../../../../src/app/app.js";

describe("PUT /reservations/:id should", () => {
  it("create a reservation", async () => {
    const res = await app.request("/reservations/1", { method: "PUT" });

    expect(res.headers.get("Location")).toBe("/reservations/1");
    expect(res.status).toBe(201);
  });
});
