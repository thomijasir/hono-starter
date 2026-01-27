import { Hono } from "hono";
import { connect } from "./controller";
import { ConnectSchema } from "./model";
import { validator } from "~/middlewares";

export const chatModule = () => {
  const routes = new Hono();
  routes.post("/connect", validator("json", ConnectSchema), connect);
  return routes;
};
