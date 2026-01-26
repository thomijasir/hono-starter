import { sql } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
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

export type UsersModel = InferSelectModel<typeof users>;

export const posts = sqliteTable("posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  tags: text("tags"),
  content: text("content", { mode: "text" }).notNull(),
  metadata: text("metadata", { mode: "json" }),
  authorId: text("author_id")
    .references(() => users.id)
    .notNull(),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export type PostsModel = InferSelectModel<typeof posts>;

export const attachments = sqliteTable("attachments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(),
  filename: text("filename").notNull(),
  path: text("path").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export type AttachmentModel = InferSelectModel<typeof attachment>;

// Chat System Schema

export const appClient = sqliteTable("app_client", {
  id: text("id").primaryKey(),
  name: text("name"), // APP Name
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export type AppClientModel = InferSelectModel<typeof appClient>;

export const chatUser = sqliteTable("chat_user", {
  id: text("id").primaryKey(), // We'll use UUID or composite key logic, but simple ID is easier for referencing
  appId: text("app_id")
    .references(() => appClient.id)
    .notNull(),
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
});

export type ChatUserModel = InferSelectModel<typeof chatUser>;

export const conversation = sqliteTable("conversation", {
  id: text("id").primaryKey(),
  appId: text("app_id").notNull(),
  type: text("type").notNull(), // 'DIRECT', 'GROUP'
  name: text("name"), // For groups
  adminId: text("admin_id").references(() => chatUser.id), // Creator/Admin
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export type ConversationModel = InferSelectModel<typeof conversation>;

export const participant = sqliteTable("participant", {
  conversationId: text("conversation_id")
    .references(() => conversation.id)
    .notNull(),
  userId: text("user_id")
    .references(() => chatUser.id)
    .notNull(),
  joinedAt: text("joined_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  lastReadAt: text("last_read_at"),
  lastReadMessageId: text("last_read_message_id"),
  // Composite PK is usually handled via extra config, for now simple table
});

export type ParticipantModel = InferSelectModel<typeof participant>;

export const message = sqliteTable("message", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id")
    .references(() => conversation.id)
    .notNull(),
  senderId: text("sender_id")
    .references(() => chatUser.id)
    .notNull(),
  type: text("type").notNull(), // 'TEXT', 'IMAGE', 'DOCUMENT', 'AUDIO', 'CALL'
  content: text("content"), // Text or URL
  metadata: text("metadata", { mode: "json" }), // JSON string for extra data
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export type MessageModel = InferSelectModel<typeof message>;

export const call = sqliteTable("call", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id")
    .references(() => conversation.id)
    .notNull(),
  startedAt: text("started_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  endedAt: text("ended_at"),
  status: text("status").notNull(), // 'ONGOING', 'ENDED'
  callerId: text("caller_id")
    .references(() => chatUser.id)
    .notNull(),
});

export type CallModel = InferSelectModel<typeof call>;
