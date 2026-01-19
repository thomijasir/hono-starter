import { and, desc, eq, gt, inArray, sql } from "drizzle-orm";
// alias removed
import type { SQL } from "drizzle-orm";
import type { 
  ConnectPayload, 
  CreateConversationPayload, 
  SendMessagePayload 
} from "./model";
import type { AppState } from "~/model";
import {
  calls,
  chatUsers,
  conversations,
  messages,
  participants,
} from "~/schemas/default";
import { generateLiveKitToken } from "~/utils";

// --- User Management ---

export const connectUser = (state: AppState, payload: ConnectPayload) => {
  const { db } = state;
  const now = new Date().toISOString();

  // Upsert user
  const [user] = db
    .insert(chatUsers)
    .values({
      id: `${payload.app_id}_${payload.user_id}`, // Composite ID simulation
      appId: payload.app_id,
      userId: payload.user_id,
      name: payload.name,
      deviceToken: payload.device_token,
      deviceType: payload.device_type,
      lastSeen: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: chatUsers.id, // Assuming ID is PK
      set: {
        lastSeen: now,
        deviceToken: payload.device_token ?? sql`device_token`,
        deviceType: payload.device_type ?? sql`device_type`,
        name: payload.name ?? sql`name`,
        updatedAt: now,
      },
    })
    .returning().all();

  return user;
};

// --- Conversation Management ---

export const createConversation = (
  state: AppState,
  payload: CreateConversationPayload,
  currentUserId: string,
  appId: string
) => {
  const { db } = state;
  
  // 1-on-1 Logic: Check if conversation exists
  if (payload.type === "DIRECT" && payload.participant_ids.length === 1) {
    const _otherUserId = payload.participant_ids[0];
    // logic...
  }

  const conversationId = crypto.randomUUID();
  const now = new Date().toISOString();

  // Create Conversation
  const [convo] = db
    .insert(conversations)
    .values({
      id: conversationId,
      appId,
      type: payload.type,
      name: payload.name,
      adminId: `${appId}_${currentUserId}`,
      updatedAt: now,
    })
    .returning().all();

  // Add Participants
  const participantIds = [currentUserId, ...payload.participant_ids].map(
    (uid) => `${appId}_${uid}`
  );
  
  // Dedup IDs
  const uniqueIds = [...new Set(participantIds)];

  if (uniqueIds.length > 0) {
    db.insert(participants).values(
      uniqueIds.map((uid) => ({
        conversationId,
        userId: uid,
        joinedAt: now,
      }))
    ).run();
  }

  return convo;
};

export const getConversations = (
  state: AppState,
  currentUserId: string,
  appId: string
) => {
  const { db } = state;
  const userKey = `${appId}_${currentUserId}`;

  // Get conversations user is part of
  // Join with last message and unread count
  // This requires a more complex query or multiple queries.
  // Using simple query for now.

  // Improved query strategy:
  // 1. Get all conversation IDs for user
  // 2. For each, get details + last message + unread count
  
  // Let's rely on basic fetch first to ensure types work
  const myParticipations = db
      .select()
      .from(participants)
      .where(eq(participants.userId, userKey))
      .all();
      
  const convoIds = myParticipations.map(p => p.conversationId);
  
  if (convoIds.length === 0) return [];
  
  // Fetch conversations details
  const convos = db
      .select()
      .from(conversations)
      .where(inArray(conversations.id, convoIds))
      .orderBy(desc(conversations.updatedAt))
      .all();
      
  // Naive n+1 for last message and unread count (for speed of dev now, optimize later)
  // Since db is sync, Promise.all is not needed, but function is async, so we can just map
  const results = convos.map((c) => {
      const [lastMsg] = db
          .select()
          .from(messages)
          .where(eq(messages.conversationId, c.id))
          .orderBy(desc(messages.createdAt))
          .limit(1)
          .all();

      const myPart = myParticipations.find(p => p.conversationId === c.id);
      const lastRead = myPart?.lastReadAt ?? '1970-01-01';
      
      const [unread] = db
          .select({ count: sql<number>`count(*)` })
          .from(messages)
          .where(and(
              eq(messages.conversationId, c.id),
              gt(messages.createdAt, lastRead)
          )).all();
          
      return {
          ...c,
          lastMessage: lastMsg ?? null,
          unreadCount: unread?.count ?? 0
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
  appId: string
) => {
  const { db } = state;
  const userKey = `${appId}_${currentUserId}`;

  const messageId = crypto.randomUUID();
  const now = new Date().toISOString();

  const [message] = db
    .insert(messages)
    .values({
      id: messageId,
      conversationId,
      senderId: userKey,
      type: payload.type,
      content: payload.content,
      metadata: payload.metadata ? JSON.stringify(payload.metadata) : undefined,
      createdAt: now,
    })
    .returning().all();

  // placeholder, see view output firstsation updatedAt
  db
    .update(conversations)
    .set({ updatedAt: now })
    .where(eq(conversations.id, conversationId))
    .run(); 
  // Trigger Push Notification
  const convoParticipants = db
    .select({
        userId: participants.userId,
        lastSeen: chatUsers.lastSeen,
        deviceToken: chatUsers.deviceToken,
        deviceType: chatUsers.deviceType,
        name: chatUsers.name
    })
    .from(participants)
    .innerJoin(chatUsers, eq(participants.userId, chatUsers.id))
    .where(eq(participants.conversationId, conversationId))
    .all();

  const offlineUsers = convoParticipants.filter(p => {
      if (p.userId === userKey) return false; // Don't send to self
      
      if (!p.lastSeen) return true; // Never seen, treat as offline
      return new Date(now) > new Date(p.lastSeen);
  });

  if (offlineUsers.length > 0) {
      const { pushService } = await import("~/utils"); 
      
      offlineUsers.forEach(u => {
          if (u.deviceToken) {
             pushService.send(
                 u.deviceToken, 
                 u.deviceType, 
                 "New Message", 
                 payload.content ?? "Sent an attachment", 
                 { conversationId }
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
  cursor?: string
) => {
  const { db } = state;

  // Basic cursor pagination using createdAt or ID
  // If cursor is provided (messageID), we look for messages older than that (assuming desc order)
  let whereClause: SQL | undefined = eq(messages.conversationId, conversationId);
  
  if (cursor) {
      // Fetch cursor message time
      const [cursorMsg] = db.select().from(messages).where(eq(messages.id, cursor)).all();
      if (cursorMsg) {
          whereClause = and(
              eq(messages.conversationId, conversationId),
              sql`${messages.createdAt} < ${cursorMsg.createdAt}`
          );
      }
  }

  return db
    .select()
    .from(messages)
    .where(whereClause)
    .orderBy(desc(messages.createdAt))
    .limit(limit)
    .all();
};

// --- LiveKit ---

export const getCallToken = async (
    conversationId: string, 
    currentUserId: string,
    appId: string
) => {
    const participantIdentity = `${appId}_${currentUserId}`;
    return await generateLiveKitToken(conversationId, participantIdentity);
}

// --- Logs ---

// --- Logs ---

export const startCall = (state: AppState, conversationId: string, callerId: string, appId: string) => {
  const { db } = state;
  const userKey = `${appId}_${callerId}`;
   
   return db.insert(calls).values({
       id: crypto.randomUUID(),
       conversationId,
       callerId: userKey,
       status: 'ONGOING',
       startedAt: new Date().toISOString()
   }).returning().all();
}

export const endCall = (state: AppState, callId: string) => {
    const { db } = state;
    return db.update(calls).set({
        status: 'ENDED',
        endedAt: new Date().toISOString()
    }).where(eq(calls.id, callId)).returning().all();
}

export const addParticipants = (
  state: AppState,
  conversationId: string,
  participantIds: string[],
  currentUserId: string,
  appId: string
) => {
  const { db } = state;
  const userKey = `${appId}_${currentUserId}`;

  // Check valid conversation and admin rights
  const [convo] = db
    .select()
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1).all();

  if (!convo) throw new Error("Conversation not found");
  if (convo.type !== "GROUP") throw new Error("Cannot add participants to direct chat");
  // Strict Admin Check
  if (convo.adminId !== userKey) throw new Error("Only admin can add participants");

  const now = new Date().toISOString();
  const newParticipantIds = participantIds.map((uid) => `${appId}_${uid}`);
  const uniqueIds = [...new Set(newParticipantIds)];

  if (uniqueIds.length > 0) {
    db.insert(participants).values(
      uniqueIds.map((uid) => ({
        conversationId,
        userId: uid,
        joinedAt: now,
      }))
    ).onConflictDoNothing().run(); // Ignore if already in
  }

  return { success: true };
};

export const removeParticipant = (
  state: AppState,
  conversationId: string,
  participantIdToRemove: string,
  currentUserId: string,
  appId: string
) => {
  const { db } = state;
  const userKey = `${appId}_${currentUserId}`;
  const targetUserKey = `${appId}_${participantIdToRemove}`;

  // Check valid conversation and admin rights
  const [convo] = db
    .select()
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1).all();

  if (!convo) throw new Error("Conversation not found");
  if (convo.type !== "GROUP") throw new Error("Cannot remove participants from direct chat");
  if (convo.adminId !== userKey) throw new Error("Only admin can remove participants");

  db
    .delete(participants)
    .where(and(
      eq(participants.conversationId, conversationId),
      eq(participants.userId, targetUserKey)
    )).run();

  return { success: true };
};
