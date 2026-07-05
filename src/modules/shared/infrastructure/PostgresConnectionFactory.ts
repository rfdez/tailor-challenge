import { PostgresConnection } from "./PostgresConnection.js";
import { config } from "./config.js";

export class PostgresConnectionFactory {
  static create(): PostgresConnection {
    return new PostgresConnection(
      config.postgres.host,
      config.postgres.port,
      config.postgres.user,
      config.postgres.password,
      config.postgres.database,
    );
  }
}
