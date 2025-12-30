import { Container } from "inversify";
import { TYPES } from "./types";
import { DatabaseConnection } from "@/db/connection/connection";
import { UnitOfWork } from "@/db/connection/unit-of-work";
import { Repository } from "@/repository/base/repository";
import { CallerService } from "@/service/caller/caller.service";
import { autoRegister } from "./auto-register";

const container = new Container({ defaultScope: "Singleton" });

//#region DB
container
  .bind<DatabaseConnection>(TYPES.DatabaseConnection)
  .to(DatabaseConnection)
  .inSingletonScope();

// UnitOfWork is request-scoped to ensure transaction isolation per request
container.bind<UnitOfWork>(TYPES.UnitOfWork).to(UnitOfWork).inRequestScope();

//#region Repository
container.bind<Repository>(TYPES.Repository).to(Repository).inSingletonScope();

// CallerService now uses AsyncLocalStorage internally,
// but we keep it in request scope for proper DI lifecycle
container.bind<CallerService>(TYPES.Caller).to(CallerService).inRequestScope();

//#region Auto-Registration
// Automatically discover and register all @Service and @AutoController decorated classes
autoRegister(container);

export { container };
