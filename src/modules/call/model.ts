import { z } from "zod";
import type { CallsModel } from "~/schemas/default";

export const CreateCallSchema = z.object({
  conversationId: z.string(),
  callerId: z.string(),
  status: z.enum(["ONGOING", "ENDED"]),
  startedAt: z.string().optional(), // Usually set by server, but allowing for sync
});

export const UpdateCallSchema = z.object({
  status: z.enum(["ONGOING", "ENDED"]).optional(),
  endedAt: z.string().optional(),
});

export const CallSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  callerId: z.string(),
  status: z.string(),
  startedAt: z.string(),
  endedAt: z.string().nullable(),
});

export type CreateCallType = z.infer<typeof CreateCallSchema>;
export type UpdateCallType = z.infer<typeof UpdateCallSchema>;
export type Call = CallsModel;
