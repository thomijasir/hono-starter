import { zValidator as baseValidator } from "@hono/zod-validator";
import type { ValidationTargets } from "hono";
import type { z } from "zod";
import { errorResponse } from "~/utils";

export const validator = <T extends z.ZodType>(
  target: keyof ValidationTargets,
  schema: T,
) =>
  baseValidator(target, schema, (result, c) => {
    if (!result.success) {
      return errorResponse(c, "Validation Error", 400, result.error.issues);
    }
    return;
  });
