import z from "zod";
import {
  getAppClient,
  updateAppClient,
  createNewAppClient,
  deleteAppClient,
} from "./controller";
import {
  AppClientResponseSchema,
  CreateAppClientSchema,
  UpdateAppClientSchema,
} from "./model";
import {
  createResponses,
  createRoute,
  createRouter,
  jsonRequest,
  jsonResponsePaginationSchema,
  jsonResponseSchema,
} from "~/utils";

export const appClientRoutes = () => {
  const appClientList = jsonResponsePaginationSchema(
    z.array(AppClientResponseSchema),
  );

  return createRouter()
    .openapi(
      createRoute({
        method: "get",
        path: "/",
        responses: createResponses(appClientList, "get app client", 200),
        tags: ["App Client"],
      }),
      getAppClient,
    )
    .openapi(
      createRoute({
        method: "post",
        path: "/",
        responses: createResponses(
          jsonResponseSchema(AppClientResponseSchema),
          "connect chat system",
          200,
        ),
        request: jsonRequest(CreateAppClientSchema),
        tags: ["App Client"],
      }),
      createNewAppClient,
    )
    .openapi(
      createRoute({
        method: "patch",
        path: "/{id}",
        responses: createResponses(
          jsonResponseSchema(CreateAppClientSchema),
          "update app client",
          200,
        ),
        request: jsonRequest(UpdateAppClientSchema),
        tags: ["App Client"],
      }),
      updateAppClient,
    )
    .openapi(
      createRoute({
        method: "delete",
        path: "/{id}",
        responses: createResponses(
          jsonResponseSchema(z.null()),
          "delete app client",
          200,
        ),
        tags: ["App Client"],
      }),
      deleteAppClient,
    );
};
