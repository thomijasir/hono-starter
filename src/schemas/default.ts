import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export const posts = sqliteTable("posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  authorId: integer("author_id")
    .references(() => users.id)
    .notNull(),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

// Chat System Schema

export const chatUsers = sqliteTable(
  "chat_users",
  {
    id: text("id").primaryKey(), // We'll use UUID or composite key logic, but simple ID is easier for referencing
    appId: text("app_id").notNull(),
    userId: text("user_id").notNull(), // External User ID from the tenant app
    name: text("name"),
    avatar: text("avatar"),
    email: text("email"),
    lastSeen: text("last_seen"),
    deviceToken: text("device_token"),
    deviceType: text("device_type"), // android, ios
    createdAt: text("created_at")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    updatedAt: text("updated_at")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
  },
  // TODO: Add unique index on (appId, userId) when Drizzle supports it easily in single define or via extra config
);

export const conversations = sqliteTable("conversations", {
  id: text("id").primaryKey(),
  appId: text("app_id").notNull(),
  type: text("type").notNull(), // 'DIRECT', 'GROUP'
  name: text("name"), // For groups
  adminId: text("admin_id").references(() => chatUsers.id), // Creator/Admin
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export const participants = sqliteTable("participants", {
  conversationId: text("conversation_id")
    .references(() => conversations.id)
    .notNull(),
  userId: text("user_id")
    .references(() => chatUsers.id)
    .notNull(),
  joinedAt: text("joined_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  lastReadAt: text("last_read_at"),
  lastReadMessageId: text("last_read_message_id"),
  // Composite PK is usually handled via extra config, for now simple table
});

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id")
    .references(() => conversations.id)
    .notNull(),
  senderId: text("sender_id")
    .references(() => chatUsers.id)
    .notNull(),
  type: text("type").notNull(), // 'TEXT', 'IMAGE', 'DOCUMENT', 'AUDIO', 'CALL'
  content: text("content"), // Text or URL
  metadata: text("metadata", { mode: "json" }), // JSON string for extra data
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export const calls = sqliteTable("calls", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id")
    .references(() => conversations.id)
    .notNull(),
  startedAt: text("started_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  endedAt: text("ended_at"),
  status: text("status").notNull(), // 'ONGOING', 'ENDED'
  callerId: text("caller_id")
    .references(() => chatUsers.id)
    .notNull(),
});
