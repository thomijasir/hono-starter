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
  email: z.email().openapi({
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

export const ConnectSignatureSchema = z
  .object({
    appId: z.string().openapi({
      description: "Unique identifier for the application",
      example: "019c04a9-b78b-7000-917f-6c2687d62ccf",
    }),
    externalId: z.string().min(1).openapi({
      description: "The user identifier from an external system",
      example: "thomijasir",
    }),
    name: z.string().openapi({
      description: "Full name of the user",
      example: "Jhon Doe",
    }),
    avatar: z.string().openapi({
      description: "URL or filename for the user profile picture",
      example: "placeholder.png",
    }),
    email: z.email().openapi({
      description: "Primary contact email address",
      example: "jhon.doe@gmail.com",
    }),
    deviceToken: z.string().openapi({
      description: "Push notification token for the device",
      example: "auau-coco-oaoa-mmee",
    }),
    deviceType: z.enum(["ANDROID", "IOS", "WEB"]).openapi({
      description: "The operating system of the device",
      example: "ANDROID",
    }),
    iat: z.number().int().openapi({
      description: "Issued At: Unix timestamp",
      example: 1769604778,
    }),
    exp: z.number().int().openapi({
      description: "Expiration: Unix timestamp",
      example: 1769605378,
    }),
  })
  .openapi("ConnectSignatureSchema");

export type ConnectSignatureType = z.infer<typeof ConnectSignatureSchema>;
