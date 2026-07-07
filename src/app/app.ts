import { swaggerUI } from "@hono/swagger-ui";
import { Hono } from "hono";
import { openAPIRouteHandler } from "hono-openapi";
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
  return c.redirect("/docs");
});

app.get("/ping", (c) => {
  return c.text("pong");
});

app.route("/restaurants", restaurants);
app.route("/reservations", reservations);

app.get(
  "/openapi.json",
  openAPIRouteHandler(app, {
    documentation: {
      info: {
        title: "Restaurants app",
        version: "1.0.0",
        description: "Restaurants app for Tailor Hub backend challenge.",
      },
    },
  }),
);

app.get(
  "/docs",
  swaggerUI({
    url: "/openapi.json",
  }),
);

export default app;
