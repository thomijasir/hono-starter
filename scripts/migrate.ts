import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";


const runMigrate = () => {
  console.log("⏳ Running migrations...");

  const sqlite = new Database("sqlite.db");
  const db = drizzle(sqlite);

  try {
    migrate(db, { migrationsFolder: "./drizzle" });
    console.log("✅ Migrations completed successfully");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    // eslint-disable-next-line n/no-process-exit
    process.exit(1);
  }

  sqlite.close();
};

runMigrate();
