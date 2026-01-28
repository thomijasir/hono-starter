import type { Call, CreateCallType, UpdateCallType } from "./model";
import * as service from "./service";
import { createHandler, createJsonHandler } from "~/utils";

export const createCall = createJsonHandler<CreateCallType, Call>(
  async ({ body, state, httpResponse, errorResponse }) => {
    const result = await service.initiateCall(state, body);

    if (!result.ok) {
      return errorResponse(result.err);
    }

    if (!result.val) {
      return errorResponse("Failed to initiate call", 500);
    }

    return httpResponse(result.val, "Call initiated", 201);
  },
);

export const updateCall = createJsonHandler<UpdateCallType, Call>(
  async ({ params, state, httpResponse, errorResponse }) => {
    const id = params.id;
    if (!id) return errorResponse("ID is required", 400);

    // In this simplified version, we might just be ending the call or updating status
    // For specific "end call" action, we might want a separate route or just use patch

    // If the body is empty or we want to support a dedicated "end" action via PATCH
    // We can check logic here. For now, generic update.

    // However, one common pattern is PATCH /calls/:id/end
    // But let's stick to standard PATCH /calls/:id with status="ENDED" in body

    // If body is empty, we might assume end call? No, let's require body.

    const result = await service.endCall(state, id); // Simplified for "end" action mostly

    if (!result.ok) {
      return errorResponse(result.err);
    }

    if (!result.val) {
      return errorResponse("Failed to update call", 500);
    }

    return httpResponse(result.val, "Call updated");
  },
);

export const getCall = createHandler(
  async ({ params, state, httpResponse, errorResponse }) => {
    const id = params.id;
    if (!id) return errorResponse("ID is required", 400);
    const result = await service.getCall(state, id);

    if (!result.ok) {
      return errorResponse(result.err, 404);
    }

    return httpResponse(result.val);
  },
);
