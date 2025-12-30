import { Department } from "@/data/entities/department";
import { VmService } from "../vm/vm.service";
import { Filter } from "@/data/filters/filter";
import { TYPES } from "@/core/container/types";
import { Repository } from "@/repository/base/repository";
import { inject } from "inversify";
import { CallerService } from "../caller/caller.service";
import { Service } from "@/core/container/auto-register";

@Service({ scope: 'request' })
export class DepartmentService extends VmService<Department, Department, Filter> {
  constructor(
    @inject(TYPES.Repository) repository: Repository,
    @inject(TYPES.Caller) callerService: CallerService
  ) {
    super(repository.Department, callerService, Department, repository);
  }
}
