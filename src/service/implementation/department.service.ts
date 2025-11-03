import { Department } from "@/data/entities/department";
import { VmService } from "../vm/vm.service";
import { Filter } from "@/data/filters/filter";
import { Result } from "@/data/response/response";
import { TYPES } from "@/core/container/types";
import { Repository } from "@/repository/base/repository";
import { inject } from "inversify";
import { CallerService } from "../caller/caller.service";

export class DepartmentService extends VmService<
  Department,
  Department,
  Filter,
  Result<Department>
> {
  constructor(
    @inject(TYPES.Repository) repository: Repository,
    @inject(TYPES.Caller) callerService: CallerService
  ) {
    super(repository.Department, callerService, Department);
  }
}
