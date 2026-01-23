import { and, desc, eq, gt, inArray, sql } from "drizzle-orm";
// alias removed
import type { SQL } from "drizzle-orm";
import type { CreateConversationPayload, SendMessagePayload } from "./model";
import type { AppState } from "~/model";
import {
  call,
  chatUser,
  conversation,
  message,
  participant,
} from "~/schemas/default";
import { generateLiveKitToken } from "~/utils";

// --- Conversation Management ---

export const createConversation = (
  { db }: AppState,
  payload: CreateConversationPayload,
  currentUserId: string,
  appId: string,
) => {
  // 1-on-1 Logic: Check if conversation exists
  if (payload.type === "DIRECT" && payload.participantIds.length === 1) {
    const _otherUserId = payload.participantIds[0];
    // logic...
  }

  const conversationId = crypto.randomUUID();
  const now = new Date().toISOString();

  // Create Conversation
  const [convo] = db
    .insert(conversation)
    .values({
      id: conversationId,
      appId,
      type: payload.type,
      name: payload.name,
      adminId: `${appId}_${currentUserId}`,
      updatedAt: now,
    })
    .returning()
    .all();

  // Add Participant
  const participantIds = [currentUserId, ...payload.participantIds].map(
    (uid) => `${appId}_${uid}`,
  );

  // Dedup IDs
  const uniqueIds = [...new Set(participantIds)];

  if (uniqueIds.length > 0) {
    db.insert(participant)
      .values(
        uniqueIds.map((uid) => ({
          conversationId,
          userId: uid,
          joinedAt: now,
        })),
      )
      .run();
  }

  return convo;
};

export const getConversations = (
  { db }: AppState,
  currentUserId: string,
  appId: string,
) => {
  const userKey = `${appId}_${currentUserId}`;

  // Get conversation user is part of
  // Join with last message and unread count
  // This requires a more complex query or multiple queries.
  // Using simple query for now.

  // Improved query strategy:
  // 1. Get all conversation IDs for user
  // 2. For each, get details + last message + unread count

  // Let's rely on basic fetch first to ensure types work
  const myParticipations = db
    .select()
    .from(participant)
    .where(eq(participant.userId, userKey))
    .all();

  const convoIds = myParticipations.map((p) => p.conversationId);

  if (convoIds.length === 0) return [];

  // Fetch conversation details
  const convos = db
    .select()
    .from(conversation)
    .where(inArray(conversation.id, convoIds))
    .orderBy(desc(conversation.updatedAt))
    .all();

  // Naive n+1 for last message and unread count (for speed of dev now, optimize later)
  // Since db is sync, Promise.all is not needed, but function is async, so we can just map
  const results = convos.map((c) => {
    const [lastMsg] = db
      .select()
      .from(message)
      .where(eq(message.conversationId, c.id))
      .orderBy(desc(message.createdAt))
      .limit(1)
      .all();

    const myPart = myParticipations.find((p) => p.conversationId === c.id);
    const lastRead = myPart?.lastReadAt ?? "1970-01-01";

    const [unread] = db
      .select({ count: sql<number>`count(*)` })
      .from(message)
      .where(
        and(eq(message.conversationId, c.id), gt(message.createdAt, lastRead)),
      )
      .all();

    return {
      ...c,
      lastMessage: lastMsg ?? null,
      unreadCount: unread?.count ?? 0,
    };
  });

  return results;
};

// --- Message Management ---

export const sendMessage = async (
  state: AppState,
  payload: SendMessagePayload,
  conversationId: string,
  currentUserId: string,
  appId: string,
) => {
  const { db } = state;
  const userKey = `${appId}_${currentUserId}`;

  const messageId = crypto.randomUUID();
  const now = new Date().toISOString();

  const [msgDate] = db
    .insert(message)
    .values({
      id: messageId,
      conversationId,
      senderId: userKey,
      type: payload.type,
      content: payload.content,
      metadata: payload.metadata ? JSON.stringify(payload.metadata) : undefined,
      createdAt: now,
    })
    .returning()
    .all();

  // placeholder, see view output firstsation updatedAt
  db.update(conversation)
    .set({ updatedAt: now })
    .where(eq(conversation.id, conversationId))
    .run();
  // Trigger Push Notification
  const convoParticipants = db
    .select({
      userId: participant.userId,
      lastSeen: chatUser.lastSeen,
      deviceToken: chatUser.deviceToken,
      deviceType: chatUser.deviceType,
      name: chatUser.name,
    })
    .from(participant)
    .innerJoin(chatUser, eq(participant.userId, chatUser.id))
    .where(eq(participant.conversationId, conversationId))
    .all();

  const offlineUsers = convoParticipants.filter((p) => {
    if (p.userId === userKey) return false; // Don't send to self

    if (!p.lastSeen) return true; // Never seen, treat as offline
    return new Date(now) > new Date(p.lastSeen);
  });

  if (offlineUsers.length > 0) {
    const { pushService } = await import("~/utils");

    offlineUsers.forEach((u) => {
      if (u.deviceToken) {
        pushService.send(
          u.deviceToken,
          u.deviceType,
          "New Message",
          payload.content ?? "Sent an attachment",
          { conversationId },
        );
      }
    });
  } // Closing IF block

  return message;
};

export const getMessages = (
  state: AppState,
  conversationId: string,
  limit: number = 50,
  cursor?: string,
) => {
  const { db } = state;

  // Basic cursor pagination using createdAt or ID
  // If cursor is provided (messageID), we look for message older than that (assuming desc order)
  let whereClause: SQL | undefined = eq(message.conversationId, conversationId);

  if (cursor) {
    // Fetch cursor message time
    const [cursorMsg] = db
      .select()
      .from(message)
      .where(eq(message.id, cursor))
      .all();
    if (cursorMsg) {
      whereClause = and(
        eq(message.conversationId, conversationId),
        sql`${message.createdAt} < ${cursorMsg.createdAt}`,
      );
    }
  }

  return db
    .select()
    .from(message)
    .where(whereClause)
    .orderBy(desc(message.createdAt))
    .limit(limit)
    .all();
};

// --- LiveKit ---

export const getCallToken = async (
  conversationId: string,
  currentUserId: string,
  appId: string,
) => {
  const participantIdentity = `${appId}_${currentUserId}`;
  return await generateLiveKitToken(conversationId, participantIdentity);
};

// --- Logs ---

// --- Logs ---

export const startCall = (
  state: AppState,
  conversationId: string,
  callerId: string,
  appId: string,
) => {
  const { db } = state;
  const userKey = `${appId}_${callerId}`;

  return db
    .insert(call)
    .values({
      id: crypto.randomUUID(),
      conversationId,
      callerId: userKey,
      status: "ONGOING",
      startedAt: new Date().toISOString(),
    })
    .returning()
    .all();
};

export const endCall = (state: AppState, callId: string) => {
  const { db } = state;
  return db
    .update(call)
    .set({
      status: "ENDED",
      endedAt: new Date().toISOString(),
    })
    .where(eq(call.id, callId))
    .returning()
    .all();
};

export const addParticipants = (
  state: AppState,
  conversationId: string,
  participantIds: string[],
  currentUserId: string,
  appId: string,
) => {
  const { db } = state;
  const userKey = `${appId}_${currentUserId}`;

  // Check valid conversation and admin rights
  const [convo] = db
    .select()
    .from(conversation)
    .where(eq(conversation.id, conversationId))
    .limit(1)
    .all();

  if (!convo) throw new Error("Conversation not found");
  if (convo.type !== "GROUP")
    throw new Error("Cannot add participant to direct chat");
  // Strict Admin Check
  if (convo.adminId !== userKey)
    throw new Error("Only admin can add participant");

  const now = new Date().toISOString();
  const newParticipantIds = participantIds.map((uid) => `${appId}_${uid}`);
  const uniqueIds = [...new Set(newParticipantIds)];

  if (uniqueIds.length > 0) {
    db.insert(participant)
      .values(
        uniqueIds.map((uid) => ({
          conversationId,
          userId: uid,
          joinedAt: now,
        })),
      )
      .onConflictDoNothing()
      .run(); // Ignore if already in
  }

  return { success: true };
};

export const removeParticipant = (
  state: AppState,
  conversationId: string,
  participantIdToRemove: string,
  currentUserId: string,
  appId: string,
) => {
  const { db } = state;
  const userKey = `${appId}_${currentUserId}`;
  const targetUserKey = `${appId}_${participantIdToRemove}`;

  // Check valid conversation and admin rights
  const [convo] = db
    .select()
    .from(conversation)
    .where(eq(conversation.id, conversationId))
    .limit(1)
    .all();

  if (!convo) throw new Error("Conversation not found");
  if (convo.type !== "GROUP")
    throw new Error("Cannot remove participant from direct chat");
  if (convo.adminId !== userKey)
    throw new Error("Only admin can remove participant");

  db.delete(participant)
    .where(
      and(
        eq(participant.conversationId, conversationId),
        eq(participant.userId, targetUserKey),
      ),
    )
    .run();

  return { success: true };
};
