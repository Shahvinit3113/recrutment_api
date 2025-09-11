import { Container } from "inversify";
import { TYPES } from "./types";
import { DatabaseConnection } from "@/db/connection/connection";
import { UserController } from "@/controllers/implementation/user.controller";
import { CallerService } from "@/service/caller/caller.service";

const container = new Container();

//#region DB
container
  .bind<DatabaseConnection>(TYPES.DatabaseConnection)
  .to(DatabaseConnection)
  .inSingletonScope();

//#region Services
// container
//   .bind<UserService>(TYPES.UserService)
//   .toDynamicValue((context) => {
//     const repository = context.container.get<UserRepository>(TYPES.UserRepository);
//     return new UserService(repository, User);
//   })
//   .inTransientScope();

//#region Controllers
container
  .bind<UserController>(TYPES.UserController)
  .to(UserController)
  .inTransientScope();

container
  .bind<CallerService>(TYPES.Caller)
  .to(CallerService)
  .inSingletonScope();

export { container };
