import { Container } from "inversify";
import { TYPES } from "./types";
import { DatabaseConnection } from "@/db/connection/connection";
import { Repository } from "@/repository/base/repository";
import { UnitOfWork } from "@/repository/unit-of-work";

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
import { FormSectionService } from "@/service/implementation/form_section.service";
import { FormFieldService } from "@/service/implementation/form_field.service";
import { FormSectionController } from "@/controllers/implementation/form_section.controller";
import { FormFieldController } from "@/controllers/implementation/form_field.controller";
import { ApplicationController } from "@/controllers/implementation/application.controller";
import { ApplicationService } from "@/service/implementation/application.service";
import { EmailTemplateController } from "@/controllers/implementation/email_template.controller";
import { EmailTemplateService } from "@/service/implementation/email_template.service";
import { OptionGroupController } from "@/controllers/implementation/option_group.controller";
import { OptionGroupService } from "@/service/implementation/option_group.service";
import { OptionsController } from "@/controllers/implementation/options.controller";
import { OptionsService } from "@/service/implementation/options.service";
import { IUnitOfWork } from "@/repository";

const container = new Container({ defaultScope: "Singleton" });

//#region DB
container
  .bind<DatabaseConnection>(TYPES.DatabaseConnection)
  .to(DatabaseConnection)
  .inSingletonScope();

//#region Repository
container.bind<Repository>(TYPES.Repository).to(Repository).inSingletonScope();

// Unit of Work (new Knex-based pattern)
container.bind<IUnitOfWork>(TYPES.UnitOfWork).to(UnitOfWork).inRequestScope();

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
  .bind<FormSectionService>(TYPES.FormSectionService)
  .to(FormSectionService)
  .inRequestScope();
container
  .bind<FormFieldService>(TYPES.FormFieldService)
  .to(FormFieldService)
  .inRequestScope();
container
  .bind<ApplicationService>(TYPES.ApplicationService)
  .to(ApplicationService)
  .inRequestScope();
container
  .bind<EmailTemplateService>(TYPES.EmailTemplateService)
  .to(EmailTemplateService)
  .inRequestScope();
container
  .bind<OptionGroupService>(TYPES.OptionGroupService)
  .to(OptionGroupService)
  .inRequestScope();
container
  .bind<OptionsService>(TYPES.OptionsService)
  .to(OptionsService)
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
container
  .bind<FormSectionController>(FormSectionController)
  .to(FormSectionController)
  .inRequestScope();
container
  .bind<FormFieldController>(FormFieldController)
  .to(FormFieldController)
  .inRequestScope();
container
  .bind<ApplicationController>(ApplicationController)
  .to(ApplicationController)
  .inRequestScope();
container
  .bind<EmailTemplateController>(EmailTemplateController)
  .to(EmailTemplateController)
  .inRequestScope();
container
  .bind<OptionGroupController>(OptionGroupController)
  .to(OptionGroupController)
  .inRequestScope();
container
  .bind<OptionsController>(OptionsController)
  .to(OptionsController)
  .inRequestScope();

export { container };
