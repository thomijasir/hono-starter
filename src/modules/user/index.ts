import { z } from "zod";
import * as controller from "./controller";
import { GetUserParamSchema, UserSchema } from "./model";
import { auth } from "~/middlewares";
import {
  createResponses,
  createRouter,
  createRoute,
  jsonResponseSchema,
} from "~/utils";

export const userRoutes = () => {
  const userResponseSchema = jsonResponseSchema(UserSchema);
  const userListResponseSchema = jsonResponseSchema(z.array(UserSchema));

  return createRouter()
    .openapi(
      createRoute({
        method: "get",
        path: "/",
        responses: createResponses(
          userListResponseSchema,
          "Get all users",
          200,
        ),
        tags: ["User"],
      }),
      controller.getAllUsers,
    )
    .openapi(
      createRoute({
        method: "get",
        path: "/myinfo",
        middleware: [auth] as const,
        responses: createResponses(
          jsonResponseSchema(
            z.object({
              id: z.number().openapi({ example: 1 }),
              name: z.string().openapi({ example: "John Doe" }),
              email: z.email().openapi({ example: "john@example.com" }),
            }),
          ),
          "Get my profile",
          200,
          {
            401: {
              description: "Unauthorized",
            },
          },
        ),
        tags: ["User"],
        security: [{ Bearer: [] }],
      }),
      controller.getMyProfile,
    )
    .openapi(
      createRoute({
        method: "get",
        path: "/{id}",
        middleware: [auth] as const,
        request: {
          params: GetUserParamSchema,
        },
        responses: createResponses(userResponseSchema, "Get user by id", 200, {
          401: {
            description: "Unauthorized",
          },
          404: {
            description: "User not found",
          },
        }),
        tags: ["User"],
        security: [{ Bearer: [] }],
      }),
      controller.getUser,
    );
};
