import { eq, sql, and } from "drizzle-orm";
import { CreateConversationSchema } from "./model";
import type { CreateConversationType, UpdateConversationType } from "./model";
import type { AppState } from "~/models";
import { conversations, participants } from "~/schemas/default";
import { Err, generateUUID, Ok, Result } from "~/utils";

export const findConversationById = async (state: AppState, id: string) => {
  const result = await Result.async(
    state.db.select().from(conversations).where(eq(conversations.id, id)),
  );

  if (!result.ok) {
    return Err(result.err);
  }

  if (result.val.length === 0) {
    return Err("Conversation not found");
  }

  return Ok(result.val[0]);
};

export const findUsersConversation = async (
  state: AppState,
  page: number = 1,
  limit: number = 10,
  payload: { appId: string; userId: string },
) => {
  const { db } = state;
  const offset = (page - 1) * limit;
  const result = await Result.async(
    db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.appId, payload.appId),
          eq(conversations.adminId, payload.userId),
        ),
      )
      .limit(limit)
      .offset(offset),
  );

  if (!result.ok) {
    return Err(result.err);
  }

  const total = await Result.async(
    state.db
      .select({ count: sql<number>`count(*)` })
      .from(conversations)
      .where(
        and(
          eq(conversations.appId, payload.appId),
          eq(conversations.adminId, payload.userId),
        ),
      ),
  );
  const totalCount = total.ok && total.val[0] ? total.val[0].count : 0;

  return Ok({ conversations: result.val, total: totalCount });
};

export const findAllConversations = async (
  state: AppState,
  page: number = 1,
  limit: number = 10,
) => {
  const offset = (page - 1) * limit;

  const result = await Result.async(
    state.db.select().from(conversations).limit(limit).offset(offset),
  );

  if (!result.ok) {
    return Err(result.err);
  }

  const total = await Result.async(
    state.db.select({ count: sql<number>`count(*)` }).from(conversations),
  );
  const totalCount = total.ok && total.val[0] ? total.val[0].count : 0;

  return Ok({ conversations: result.val, total: totalCount });
};

export const saveNewConversation = async (
  state: AppState,
  payload: CreateConversationType,
) => {
  const { db } = state;
  const checkPayload = CreateConversationSchema.safeParse(payload);

  // Step 1. Check Payload Before Insert
  if (checkPayload.error) {
    return Err(checkPayload.error);
  }

  // Step 2. Create conversation
  const result = await Result.async(
    db.insert(conversations).values(checkPayload.data).returning(),
  );

  if (!result.ok) {
    return Err(result.err);
  }

  const createdConversation = result.val[0];

  if (!createdConversation) {
    return Err("error create user");
  }

  // Step 3. Return what we insert
  return Ok(createdConversation);
};

export const saveNewConversationWithParticipants = async (
  state: AppState,
  payload: CreateConversationType,
) => {
  const { db } = state;
  const checkPayload = CreateConversationSchema.safeParse(payload);

  // Step 1. Check Payload Before Insert
  if (checkPayload.error) {
    return Err(checkPayload.error);
  }

  // Step 2. Create conversation
  const result = await Result.async(
    db.transaction(async (tx) => {
      const { data } = checkPayload;
      // 1. Create Conversation
      const [newConversation] = await tx
        .insert(conversations)
        .values({
          id: data.id,
          name: data.name,
          appId: data.appId,
          type: data.type,
          adminId: data.adminId,
        })
        .returning();

      if (!newConversation) {
        tx.rollback();
        // failure to create conversation
        return;
      }

      // 2. create batch participants
      const participantRows = data.participants.map((userId) => ({
        id: generateUUID(),
        conversationId: newConversation.id,
        userId: userId,
      }));

      // 3. batch insert participants
      if (participantRows.length > 0) {
        await tx.insert(participants).values(participantRows);
      }

      return newConversation;
    }),
  );

  if (!result.ok) {
    return Err(result.err);
  }

  if (!result.val) {
    return Err("failure conversation");
  }

  // Step 3. Return what we insert
  return Ok(result.val);
};

export const saveConversation = async (
  state: AppState,
  id: string,
  payload: UpdateConversationType,
) => {
  const result = await Result.async(
    state.db
      .update(conversations)
      .set({ ...payload, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(conversations.id, id))
      .returning(),
  );

  if (!result.ok) return Err(result.err);
  if (result.val.length === 0) return Err("Conversation not found");

  return Ok(result.val[0]);
};

export const deleteConversationById = async (state: AppState, id: string) => {
  const result = await Result.async(
    state.db.delete(conversations).where(eq(conversations.id, id)),
  );

  if (!result.ok) {
    return Err(result.err);
  }

  return Ok(null);
};
