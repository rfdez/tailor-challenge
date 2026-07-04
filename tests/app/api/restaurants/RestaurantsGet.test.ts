import { describe, expect, it } from "vitest";

import app from "../../../../src/app/app.js";

describe("GET /restaurants should", () => {
  it("return all restaurants", async () => {
    const res = await app.request("/restaurants");

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ restaurants: expect.any(Array) });
  });
});
