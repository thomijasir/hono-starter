import { Hono } from "hono";
import { validator } from "~/middlewares";
import { ConnectSchema } from "./model";
import { connect } from "./controller";

export const chatModule = () => {
  const routes = new Hono();
  routes.post("/connect", validator("json", ConnectSchema), connect);
  return routes;
};
