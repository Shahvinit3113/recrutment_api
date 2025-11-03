import { RouteLoader } from "@/core/helper/route-loader";
import { Router } from "express";
import { UserController } from "./implementation/user.controller";
import { container } from "@/core/container/container";
import { UserInfoController } from "./implementation/user-info.controller";
import { AuthController } from "./implementation/auth.controller";
import { TaskController } from "./implementation/task.controller";
import { PositionsController } from "./implementation/positions.controller";
import { OrganizationController } from "./implementation/organization.controller";
import { DepartmentController } from "./implementation/department.controller";

export function initiControllersRoutes() {
  const router = Router();
  RouteLoader.loadMultipleControllers(
    router,
    [
      UserController,
      UserInfoController,
      AuthController,
      TaskController,
      PositionsController,
      OrganizationController,
      DepartmentController,
    ],
    container
  );

  return router;
}
