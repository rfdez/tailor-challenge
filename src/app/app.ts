import { Hono } from "hono";
import { logger } from "hono/logger";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";

import reservations from "./api/reservations.js";
import restaurants from "./api/restaurants.js";

const app = new Hono();

app.use(logger());
app.use(requestId());
app.use(secureHeaders());

app.get("/", (c) => {
  return c.text("Hello from Tailor!");
});

app.get("/ping", (c) => {
  return c.text("pong");
});

app.route("/restaurants", restaurants);
app.route("/reservations", reservations);

export default app;
