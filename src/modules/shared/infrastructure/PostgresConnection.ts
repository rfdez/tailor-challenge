/* eslint-disable @typescript-eslint/no-explicit-any */
import postgres, { type Row } from "postgres";

export class PostgresConnection {
  public readonly sql: postgres.Sql;

  constructor(url: string) {
    this.sql = postgres(url, {
      onnotice: () => {
        // Ignore notice messages from PostgreSQL
      },
    });
  }

  async searchOne<T extends Row>(
    strings: TemplateStringsArray,
    ...values: any[]
  ): Promise<T | null> {
    const query = this.sql<T[]>(strings, ...values);
    const result = await query;

    return result[0] ?? null;
  }

  async searchMany<T extends Row>(
    strings: TemplateStringsArray,
    ...values: any[]
  ): Promise<T[]> {
    const query = this.sql<T[]>(strings, ...values);
    const result = await query;

    return result;
  }

  async execute(
    strings: TemplateStringsArray,
    ...values: any[]
  ): Promise<void> {
    await this.sql(strings, ...values);
  }

  async end(): Promise<void> {
    await this.sql.end();
  }

  async truncateAll(): Promise<void> {
    await this.sql`DO
      $$
      DECLARE
          r RECORD;
      BEGIN
          FOR r IN (SELECT schemaname, tablename
                    FROM pg_tables
                    WHERE schemaname IN ('public'))
          LOOP
              EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename) || ' CASCADE';
          END LOOP;
      END
      $$;`;
  }
}
