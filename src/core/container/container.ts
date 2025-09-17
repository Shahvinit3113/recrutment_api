import { Container } from "inversify";
import { TYPES } from "./types";
import { DatabaseConnection } from "@/db/connection/connection";
import { UserController } from "@/controllers/implementation/user.controller";
import { CallerService } from "@/service/caller/caller.service";
import { GymController } from "@/controllers/implementation/gym.controller";
import { GymService } from "@/service/implementation/gym.service";
import { UserService } from "@/service/implementation/user.service";
import { Respository } from "@/repository/implementation/repository";
import { User } from "@/data/entities/user";
import { GymRepository } from "@/repository/gym.repository";
import { UserRepository } from "@/repository/user.repository";

const container = new Container({ defaultScope: "Singleton" });

//#region DB
container
  .bind<DatabaseConnection>(TYPES.DatabaseConnection)
  .to(DatabaseConnection)
  .inSingletonScope();

//#region Repository
container
  .bind<GymRepository>(TYPES.GymRepository)
  .to(GymRepository)
  .inSingletonScope();

container
  .bind<UserRepository>(TYPES.UserRepository)
  .to(UserRepository)
  .inSingletonScope();

container
  .bind<Respository<User>>(TYPES.Resposity)
  .toDynamicValue((context) =>
    context.get<UserRepository>(TYPES.UserRepository)
  )
  .inSingletonScope();

//#region Services
container.bind<GymService>(TYPES.GymService).to(GymService).inRequestScope();

container.bind<UserService>(TYPES.UserService).to(UserService).inRequestScope();

//#region Controllers
container
  .bind<UserController>(TYPES.UserController)
  .to(UserController)
  .inRequestScope();

container
  .bind<GymController>(TYPES.GymController)
  .to(GymController)
  .inRequestScope();

export { container };
