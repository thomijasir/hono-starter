import fs from "node:fs/promises";
import path from "node:path";
import {
  ATTACHMENT_ACCEPTED_FILE_TYPES,
  ATTACHMENT_MAX_FILE_SIZE,
  ATTACHMENT_UPLOAD_DIR,
} from "~/constants";
import { generateUUID, Ok, Err, Result } from "~/utils";
import type { ResultType } from "~/utils";

export const fileService = {
  handleFileUpload: async (
    file: File,
  ): Promise<
    ResultType<
      {
        path: string;
        filename: string;
        size: number;
        mimeType: string;
        originalName: string;
      },
      string
    >
  > => {
    // 1. Validation Logic
    if (file.size > ATTACHMENT_MAX_FILE_SIZE) {
      return Err("File size exceeds 5MB limit");
    }

    if (!ATTACHMENT_ACCEPTED_FILE_TYPES.includes(file.type)) {
      return Err("Invalid file type. Only PNG, JPG, WebP, and PDF are allowed");
    }

    // 2. Wrap risky async operation
    return await Result.async(
      (async () => {
        const uuid = generateUUID();
        const ext = path.extname(file.name);
        const filename = `${uuid}${ext}`;
        const relativePath = `/assets/images/${filename}`;
        const absolutePath = path.join(
          process.cwd(),
          ATTACHMENT_UPLOAD_DIR,
          filename,
        );

        const arrayBuffer = await file.arrayBuffer();
        await Bun.write(absolutePath, arrayBuffer);

        return {
          path: relativePath,
          filename: filename,
          size: file.size,
          mimeType: file.type,
          originalName: file.name,
        };
      })(),
    ).then((res) => {
      // Map generic Error to string message if failed
      if (!res.ok) {
        return Err(
          res.err instanceof Error ? res.err.message : "Upload failed",
        );
      }
      return res;
    });
  },

  deleteFile: async (
    relativePath: string,
  ): Promise<ResultType<boolean, string>> => {
    return await Result.async(
      (async () => {
        // relativePath starts with /assets/..., we need to strip leading slash or join safely
        const cleanPath = relativePath.startsWith("/")
          ? relativePath.slice(1)
          : relativePath;
        const absolutePath = path.join(process.cwd(), "public", cleanPath);
        await fs.unlink(absolutePath);
        return true;
      })(),
    ).then((res) => {
      if (!res.ok) {
        // Result wrapper types err as E (default Error)
        const error = res.err;
        if (
          typeof error === "object" &&
          "code" in error &&
          (error as { code: string }).code === "ENOENT"
        ) {
          return Ok(true);
        }
        return Err("Failed to delete file");
      }
      return Ok(true);
    });
  },
};
