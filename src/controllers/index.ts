import { RouteLoader } from "@/core/helper/route-loader";
import { Router } from "express";
import { UserController } from "./implementation/user.controller";
import { container } from "@/core/container/container";
import { UserInfoController } from "./implementation/user-info.controller";
import { AuthController } from "./implementation/auth.controller";

export function initiControllersRoutes() {
  const router = Router();
  RouteLoader.loadMultipleControllers(
    router,
    [UserController, UserInfoController, AuthController],
    container
  );

  return router;
}
