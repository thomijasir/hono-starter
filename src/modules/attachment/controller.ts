import type { JWTAuthDataType } from "../auth/model";
import {
  saveAttachment,
  findAttachmentById,
  deleteAttachmentById,
  findAllAttachments,
} from "./repository";
import { fileService } from "./service";
import type { AttachmentModel } from "~/schemas/default";
import { createFormHandler, createHandler } from "~/utils";

export const uploadAttachment = createFormHandler<
  { file: File },
  AttachmentModel,
  JWTAuthDataType
>(async ({ state, body, claim, httpResponse, errorResponse }) => {
  const file = body.file;
  if (!(file instanceof File)) {
    return errorResponse("No file uploaded or invalid format", 400);
  }

  // 1. Service: Handle File Upload
  const fileResult = await fileService.handleFileUpload(file);
  if (!fileResult.ok) {
    return errorResponse(fileResult.err);
  }
  const fileData = fileResult.val;

  // 2. Repository: Save Metadata
  const savedResult = await saveAttachment(state, {
    userId: claim.id,
    filename: fileData.filename,
    path: fileData.path,
    mimeType: fileData.mimeType,
    size: fileData.size,
  });

  if (!savedResult.ok) {
    // Rollback: cleanup file if db save fails
    await fileService.deleteFile(fileData.path);
    // Be explicit about internal error vs bad request if possible,
    // but repository usually returns generic errors.
    return errorResponse(savedResult.err);
  }

  return httpResponse(savedResult.val, "File uploaded successfully", 201);
});

export const deleteAttachment = createHandler<null, JWTAuthDataType>(
  async ({ state, params, claim, httpResponse, errorResponse }) => {
    const id = Number(params.id);

    // 1. Check Existence
    const attachmentResult = await findAttachmentById(state, id);
    if (!attachmentResult.ok) {
      return errorResponse("failed to find attachment", 404);
    }
    const attachment = attachmentResult.val;

    // 2. Check Ownership
    if (attachment.userId !== claim.id) {
      return errorResponse("Forbidden", 403);
    }

    // 3. Delete File (Idempotent success)
    const fileResult = await fileService.deleteFile(attachment.path);
    if (!fileResult.ok) {
      return errorResponse("failed to delete file");
    }

    // 4. Delete Record
    const deleteResult = await deleteAttachmentById(state, id);
    if (!deleteResult.ok) {
      return errorResponse("failed to delete attachment");
    }

    return httpResponse(null, "Attachment deleted successfully");
  },
);

export const getAttachments = createHandler(
  async ({ state, query, httpResponse, errorResponse }) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const search = query.search;
    const type = query.type;

    const result = await findAllAttachments(state, page, limit, search, type);
    if (!result.ok) {
      return errorResponse("failed to fetch attachments");
    }

    return httpResponse(result.val, "Attachments fetched successfully", 200, {
      page,
      limit,
      total: result.val.total,
      totalPages: Math.ceil(result.val.total / limit),
    });
  },
);
