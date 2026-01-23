import { z } from "zod";

export const ConnectSchema = z.object({
  appId: z.string().min(1),
  userId: z.string().min(1),
  username: z.string().min(1),
  name: z.string(),
  avatar: z.string(),
  email: z.email(),
  deviceToken: z.string().optional(),
  deviceType: z.enum(["ANDROID", "IOS", "WEB"]).optional(),
});

export type ConnectPayload = z.infer<typeof ConnectSchema>;
