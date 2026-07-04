import { serve } from "@hono/node-server";

import app from "./app/app.js";
import { config } from "./modules/shared/infrastructure/config.js";

const server = serve(
  {
    fetch: app.fetch,
    hostname: config.host,
    port: config.port,
  },
  (info) => {
    console.log(`Server is running on http://${info.address}:${info.port}`);
  },
);

process.on("SIGINT", () => {
  server.close();
  process.exit(0);
});

process.on("SIGTERM", () => {
  server.close((err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    process.exit(0);
  });
});
