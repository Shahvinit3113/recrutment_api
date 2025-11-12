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
import { PositionsService } from "@/service/implementation/positions.service";
import { PositionsController } from "@/controllers/implementation/positions.controller";
import { OrganizationService } from "@/service/implementation/organization.service";
import { OrganizationController } from "@/controllers/implementation/organization.controller";
import { DepartmentService } from "@/service/implementation/department.service";
import { DepartmentController } from "@/controllers/implementation/department.controller";
import { FormTemplateController } from "@/controllers/implementation/form_template.controller";
import { FormTemplateService } from "@/service/implementation/form_template.service";

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
  .bind<PositionsService>(TYPES.PositionsService)
  .to(PositionsService)
  .inRequestScope();
container
  .bind<OrganizationService>(TYPES.OrganizationService)
  .to(OrganizationService)
  .inRequestScope();
container
  .bind<DepartmentService>(TYPES.DepartmentService)
  .to(DepartmentService)
  .inRequestScope();
container
  .bind<FormTemplateService>(TYPES.FormTemplateService)
  .to(FormTemplateService)
  .inRequestScope();

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
container
  .bind<PositionsController>(PositionsController)
  .to(PositionsController)
  .inRequestScope();
container
  .bind<OrganizationController>(OrganizationController)
  .to(OrganizationController)
  .inRequestScope();
container
  .bind<DepartmentController>(DepartmentController)
  .to(DepartmentController)
  .inRequestScope();
container
  .bind<FormTemplateController>(FormTemplateController)
  .to(FormTemplateController)
  .inRequestScope();

export { container };
