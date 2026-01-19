import { SQL } from "bun";
import { Database as BunSQLite } from "bun:sqlite";
import type { BunSQLDatabase } from "drizzle-orm/bun-sql";
import { drizzle as drizzleSql } from "drizzle-orm/bun-sql";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import { drizzle as drizzleSqlite } from "drizzle-orm/bun-sqlite";
import { log } from "~/utils";

export type DbDriver = "SQLITE" | "PGSQL" | "MYSQL";
export type DrizzleDBSqlite = BunSQLiteDatabase;
export type DrizzleDBSql = BunSQLDatabase;

export class DBSqliteService {
  public client: BunSQLite;
  public db: BunSQLiteDatabase;
  public driver = "SQLITE" as const;

  constructor(url: string) {
    const dbName = url;
    this.client = new BunSQLite(dbName);
    this.db = drizzleSqlite({ client: this.client, casing: "snake_case" });
    log.info(`[Database] Initializing connection for driver: ${this.driver}`);
  }

  public close() {
    log.info("[Database] Closing connection...");
    this.client.close();
    log.info("[Database] Connection closed.");
  }

  public query(sql: string) {
    log.info(`[Database] Executing raw query: ${sql}`);
    return this.client.query(sql).all();
  }
}

export class DBSqlService {
  public client: SQL;
  public db: BunSQLDatabase;
  public driver: "PGSQL" | "MYSQL";

  constructor(driver: "PGSQL" | "MYSQL", url: string) {
    this.driver = driver;
    if (!url) {
      throw new Error(`Database URL is required for driver: ${driver}`);
    }
    this.client = new SQL(url);
    this.db = drizzleSql({ client: this.client, casing: "snake_case" });
    log.info(`[Database] Initializing connection for driver: ${this.driver}`);
  }

  public async close() {
    log.info("[Database] Closing connection...");
    await this.client.end();
    log.info("[Database] Connection closed.");
  }

  public async query(sql: string) {
    log.info(`[Database] Executing raw query: ${sql}`);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await this.client(sql);
  }
}
