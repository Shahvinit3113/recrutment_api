import { Department } from "@/data/entities/department";
import { BaseController } from "../base/base.controller";
import { Filter } from "@/data/filters/filter";
import { TYPES } from "@/core/container/types";
import { inject } from "inversify";
import { DepartmentService } from "@/service/implementation/department.service";
import { authenticate } from "@/middleware/implementation/auth";
import { AutoController } from "@/core/container/auto-register";

@AutoController("/department", [authenticate])
export class DepartmentController extends BaseController<Department, Department, Filter> {
  constructor(
    @inject(TYPES.DepartmentService) departmentService: DepartmentService
  ) {
    super(departmentService);
  }
}
