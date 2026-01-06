import { Application } from "@/data/entities/application";
import { BaseController } from "../base/base.controller";
import { Filter } from "@/data/filters/filter";
import { Result } from "@/data/response/response";
import { inject, injectable } from "inversify";
import { TYPES } from "@/core/container/types";
import { ApplicationService } from "@/service/implementation/application.service";
import { controller } from "@/core/decorators/controller.decorator";
import { authenticate } from "@/middleware/implementation/auth";

@injectable()
@controller("/application", [authenticate])
export class ApplicationController extends BaseController<
  Application,
  Application,
  Filter,
  Result<Application>
> {
  constructor(
    @inject(TYPES.ApplicationService) applicationService: ApplicationService
  ) {
    super(applicationService);
  }
}
