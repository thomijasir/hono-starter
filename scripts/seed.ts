import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { users } from "../src/schemas/default";

const runSeed = async () => {
  console.log("🌱 Seeding database...");

  const sqlite = new Database("sqlite.db");
  const db = drizzle(sqlite);

  try {
    const hashedPassword = await Bun.password.hash("password", {
      algorithm: "bcrypt",
      cost: 4,
    });
    // Insert sample user
    db.insert(users)
      .values({
        id: Bun.randomUUIDv7(),
        name: "Test User",
        email: "test@example.com",
        password: hashedPassword,
      })
      .run();
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  }

  sqlite.close();
};

runSeed()
  .then(() => {
    console.log("✅ Seed data created successfully");
  })
  .catch(() => {
    // eslint-disable-next-line n/no-process-exit
    process.exit(1);
  });
