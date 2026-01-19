import type { z } from "zod";
import type { LoginSchema, RegisterSchema } from "./model";
import * as authService from "./service";
import type { HandlerContext } from "~/model";
import { createHandler } from "~/utils";

export const login = createHandler(
  async ({ state, body, httpResponse }: HandlerContext) => {
    // We can safely cast body because of the zValidator middleware
    const payload = body as z.infer<typeof LoginSchema>;
    const token = await authService.login(state, payload);
    return httpResponse(token, "Login successful");
  },
);

export const register = createHandler(
  async ({ state, body, httpResponse }: HandlerContext) => {
    // We can safely cast body because of the zValidator middleware
    const payload = body as z.infer<typeof RegisterSchema>;
    const token = await authService.register(state, payload);
    return httpResponse(token, "Registration successful", 201);
  },
);
