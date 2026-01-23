import * as controller from "./controller";
import { AuthResponseSchema, LoginSchema, RegisterSchema } from "./model";
import { validator } from "~/middlewares";
import {
  jsonResponseSchema,
  jsonRequest,
  createResponses,
  createRouter,
  createRoute,
} from "~/utils";

export const authRoutes = () => {
  const successResponseSchema = jsonResponseSchema(AuthResponseSchema);
  return createRouter()
    .openapi(
      createRoute({
        method: "post",
        path: "/login",
        middleware: [validator("json", LoginSchema)],
        request: jsonRequest(LoginSchema),
        responses: createResponses(
          successResponseSchema,
          "Login successful",
          200,
          {
            401: {
              description: "Invalid credentials",
            },
          },
        ),
        tags: ["Auth"],
      }),
      controller.login,
    )
    .openapi(
      createRoute({
        method: "post",
        path: "/register",
        request: jsonRequest(RegisterSchema),
        responses: createResponses(
          successResponseSchema,
          "Registration successful",
          201,
          {
            400: {
              description: "Validation error or User already exists",
            },
          },
        ),
        tags: ["Auth"],
      }),
      controller.register,
    );
};
