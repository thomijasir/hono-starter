import { z } from "zod";

export const ConnectSchema = z.object({
  appId: z.string().min(1).openapi({
    example: "019bfff5-cc66-7000-ae0b-aa64d0403932",
    description: "identifier app ",
  }),
  externalId: z.string().min(1).openapi({
    example: "thomijasir",
    description: "this external id can be username or id from provide system",
  }),
  name: z.string().openapi({
    example: "Jhon Doe",
  }),
  avatar: z.string().openapi({ example: "placeholder.png" }),
  email: z
    .email()
    .openapi({
      example: "jhon.doe@gmail.com",
      description: "it use for search user within the system",
    }),
  deviceToken: z
    .string()
    .optional()
    .openapi({ example: "auau-coco-oaoa-mmee" }),
  deviceType: z.enum(["ANDROID", "IOS", "WEB"]).optional(),
});

export type ConnectType = z.infer<typeof ConnectSchema>;
