import { describe, expect, it } from "vitest";

import app from "../../src/app/app.js";

describe("GET /ping should", () => {
  it("return pong", async () => {
    const res = await app.request("/ping");

    expect(res.status).toBe(200);
    expect(await res.text()).toBe("pong");
  });
});
