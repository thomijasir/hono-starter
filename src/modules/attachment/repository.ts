import { eq, desc, like, and } from "drizzle-orm";
import type { AppState } from "~/models";
import { attachments } from "~/schemas/default";
import { Ok, Err, Result } from "~/utils";

export const saveAttachment = async (
  state: AppState,
  payload: {
    userId: string;
    filename: string;
    path: string;
    mimeType: string;
    size: number;
  },
) => {
  const result = await Result.async(
    state.db.insert(attachments).values(payload).returning(),
  );

  if (!result.ok) {
    return Err(result.err);
  }

  const saved = result.val[0];
  if (!saved) {
    return Err("Failed to save attachments");
  }

  return Ok(saved);
};

export const findAttachmentById = async (state: AppState, id: number) => {
  const result = await Result.async(
    state.db.select().from(attachments).where(eq(attachments.id, id)),
  );

  if (!result.ok) {
    return Err(result.err);
  }

  const found = result.val[0];
  if (!found) {
    return Err("attachments not found");
  }

  return Ok(found);
};

export const deleteAttachmentById = async (state: AppState, id: number) => {
  const result = await Result.async(
    state.db.delete(attachments).where(eq(attachments.id, id)),
  );

  if (!result.ok) {
    return Err(result.err);
  }

  return Ok(true);
};

export const findAllAttachments = async (
  state: AppState,
  page: number = 1,
  limit: number = 10,
  search?: string,
  type?: string,
) => {
  const offset = (page - 1) * limit;
  const conditions = [];

  if (search) {
    conditions.push(like(attachments.filename, `%${search}%`));
  }
  if (type) {
    conditions.push(like(attachments.mimeType, `%${type}%`));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const listPromise = state.db
    .select()
    .from(attachments)
    .where(whereClause)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(attachments.createdAt));

  const countPromise = state.db
    .select({ id: attachments.id })
    .from(attachments)
    .where(whereClause);

  const [listResult, countResult] = await Promise.all([
    Result.async(listPromise),
    Result.async(countPromise),
  ]);

  if (!listResult.ok) {
    return Err(listResult.err);
  }
  if (!countResult.ok) {
    return Err(countResult.err);
  }

  return Ok({
    attachments: listResult.val,
    total: countResult.val.length,
  });
};
