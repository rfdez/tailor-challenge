import { Hono } from "hono";

const app = new Hono();

app.put("/:id", async (c) => {
  const id = c.req.param("id");

  return c.json(null, 201, {
    Location: `/reservations/${id}`,
  });
});

export default app;
