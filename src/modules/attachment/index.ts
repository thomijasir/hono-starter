import { z } from "@hono/zod-openapi";
import * as controller from "./controller";
import {
  AttachmentSchema,
  UploadAttachmentSchema,
  GetAttachmentsQuerySchema,
} from "./model";
import { auth } from "~/middlewares";
import {
  createResponses,
  createRoute,
  createRouter,
  formRequest,
  jsonResponseSchema,
} from "~/utils";

export const attachmentRoutes = () => {
  const attachmentResponseSchema = jsonResponseSchema(AttachmentSchema);
  const attachmentListResponseSchema = jsonResponseSchema(
    z.object({
      attachments: z.array(AttachmentSchema),
      total: z.number(),
    }),
  );

  return createRouter()
    .openapi(
      createRoute({
        method: "post",
        path: "/",
        middleware: [auth] as const,
        request: formRequest(UploadAttachmentSchema, "Upload a file"),
        responses: createResponses(
          attachmentResponseSchema,
          "File uploaded successfully",
          201,
          {
            401: { description: "Unauthorized" },
            400: { description: "Invalid file or parameters" },
          },
        ),
        tags: ["Attachment"],
        security: [{ Bearer: [] }],
      }),
      controller.uploadAttachment,
    )
    .openapi(
      createRoute({
        method: "delete",
        path: "/{id}",
        middleware: [auth] as const,
        request: {
          params: z.object({ id: z.string().or(z.number()) }), // Allow string param for route, cast in controller
        },
        responses: createResponses(
          jsonResponseSchema(z.null()),
          "Attachment deleted",
          200,
          {
            401: { description: "Unauthorized" },
            403: { description: "Forbidden" },
            404: { description: "Not Found" },
          },
        ),
        tags: ["Attachment"],
        security: [{ Bearer: [] }],
      }),
      controller.deleteAttachment,
    )
    .openapi(
      createRoute({
        method: "get",
        path: "/",
        request: {
          query: GetAttachmentsQuerySchema,
        },
        responses: createResponses(
          attachmentListResponseSchema,
          "List attachments",
          200,
        ),
        tags: ["Attachment"],
      }),
      controller.getAttachments,
    );
};
