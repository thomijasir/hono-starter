import { z } from "@hono/zod-openapi";

export const AppClientResponseSchema = z.object({
  id: z.uuidv7().openapi({ example: "01809424-3e59-7c05-9219-566f82fff672" }),
  name: z.string().openapi({ example: "ceshx app" }),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateAppClientSchema = z.object({
  name: z.string().openapi({ example: "ceshx chat app" }),
});

export type CreateAppClientType = z.infer<typeof CreateAppClientSchema>;

export const UpdateAppClientSchema = CreateAppClientSchema.partial();
export type UpdateAppClientType = z.infer<typeof UpdateAppClientSchema>;
