import { SQL } from "bun";
import { Database as BunSQLite } from "bun:sqlite";
import type { BunSQLDatabase } from "drizzle-orm/bun-sql";
import { drizzle as drizzleSql } from "drizzle-orm/bun-sql";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import { drizzle as drizzleSqlite } from "drizzle-orm/bun-sqlite";

import { log } from "~/utils";

export type DbDriver = "SQLITE" | "PGSQL" | "MYSQL";
export type DrizzleDB = BunSQLiteDatabase | BunSQLDatabase;

export class Database {
  public client: BunSQLite | SQL;
  public db: BunSQLiteDatabase | BunSQLDatabase;
  private driver: DbDriver;

  constructor(driver: DbDriver, url: string) {
    this.driver = driver;
    // Initializing with temporary values to satisfy TS, will be overwritten in init
    // essentially definite assignment assertion, but cleaner to just init
    if (driver === "SQLITE") {
      const dbName = url;
      this.client = new BunSQLite(dbName);
      this.db = drizzleSqlite({ client: this.client });
    } else {
      if (!url) {
        throw new Error(`Database URL is required for driver: ${driver}`);
      }
      this.client = new SQL(url);
      this.db = drizzleSql({ client: this.client });
    }

    // Logging after init
    log.info(`[Database] Initializing connection for driver: ${this.driver}`);
  }

  public async close() {
    log.info("[Database] Closing connection...");
    if (this.driver === "SQLITE") {
      // client is BunSQLite | SQL
      // guarded by driver check, but TS might need casting or narrowing if it doesn't track this.driver correlation
      (this.client as BunSQLite).close();
    } else {
      await (this.client as SQL).end();
    }
    log.info("[Database] Connection closed.");
  }

  public async query(sql: string) {
    log.info(`[Database] Executing raw query: ${sql}`);
    if (this.driver === "SQLITE") {
      return (this.client as BunSQLite).query(sql).all();
    }
    // Bun SQL
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await (this.client as SQL)(sql);
  }
}
