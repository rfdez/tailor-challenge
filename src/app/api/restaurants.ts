import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
  return c.json({ restaurants: [] });
});

export default app;
