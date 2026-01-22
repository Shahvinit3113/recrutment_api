import { Department } from "@/data/entities/department";
import { BaseController } from "../base/base.controller";
import { Filter } from "@/data/filters/filter";
import { Result } from "@/data/response/response";
import { TYPES } from "@/core/container/types";
import { inject, injectable } from "inversify";
import { DepartmentService } from "@/service/implementation/department.service";
import { controller } from "@/core/decorators/controller.decorator";
import { authenticate } from "@/middleware/implementation/auth";
import { initializeCaller } from "@/middleware/implementation/callerInit";

@injectable()
@controller("/department", [initializeCaller, authenticate])
export class DepartmentController extends BaseController<
  Department,
  Department,
  Filter,
  Result<Department>
> {
  constructor(
    @inject(TYPES.DepartmentService) departmentService: DepartmentService,
  ) {
    super(departmentService);
  }
}
