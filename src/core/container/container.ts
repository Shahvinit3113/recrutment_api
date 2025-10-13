import { Container } from "inversify";
import { TYPES } from "./types";
import { DatabaseConnection } from "@/db/connection/connection";
import { Repository } from "@/repository/base/repository";

import { UserService } from "@/service/implementation/user.service";
import { UserInfoService } from "@/service/implementation/user-info.service";
import { CallerService } from "@/service/caller/caller.service";

import { UserController } from "@/controllers/implementation/user.controller";
import { UserInfoController } from "@/controllers/implementation/user-info.controller";
import { AuthService } from "@/service/implementation/auth.service";
import { AuthController } from "@/controllers/implementation/auth.controller";
import { TaskController } from "@/controllers/implementation/task.controller";
import { TaskService } from "@/service/implementation/task.service";

const container = new Container({ defaultScope: "Singleton" });

//#region DB
container
  .bind<DatabaseConnection>(TYPES.DatabaseConnection)
  .to(DatabaseConnection)
  .inSingletonScope();

//#region Repository
container.bind<Repository>(TYPES.Repository).to(Repository).inSingletonScope();

//#region Services
container.bind<UserService>(TYPES.UserService).to(UserService).inRequestScope();
container
  .bind<UserInfoService>(TYPES.UserInfoService)
  .to(UserInfoService)
  .inRequestScope();
container.bind<TaskService>(TYPES.TaskService).to(TaskService).inRequestScope();
container.bind<AuthService>(TYPES.AuthService).to(AuthService).inRequestScope();

container
  .bind<CallerService>(TYPES.Caller)
  .to(CallerService)
  .inSingletonScope();

//#region Controllers
// Bind controllers by class only (RouteLoader resolves by class)
container
  .bind<UserController>(UserController)
  .to(UserController)
  .inRequestScope();
container
  .bind<UserInfoController>(UserInfoController)
  .to(UserInfoController)
  .inRequestScope();
container
  .bind<AuthController>(AuthController)
  .to(AuthController)
  .inRequestScope();
container
  .bind<TaskController>(TaskController)
  .to(TaskController)
  .inRequestScope();

export { container };
