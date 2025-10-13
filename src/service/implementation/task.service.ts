import { Task } from "@/data/entities/task";
import { IVmService, VmService } from "../vm/vm.service";
import { Filter } from "@/data/filters/filter";
import { Result } from "@/data/response/response";
import { inject } from "inversify";
import { TYPES } from "@/core/container/types";
import { Repository } from "@/repository/base/repository";
import { CallerService } from "../caller/caller.service";

export interface ITaskService
  extends IVmService<Task, Task, Filter, Result<Task>> {}

export class TaskService
  extends VmService<Task, Task, Filter, Result<Task>>
  implements ITaskService
{
  constructor(
    @inject(TYPES.Repository) repository: Repository,
    @inject(TYPES.Caller) callerService: CallerService
  ) {
    super(repository.Task, callerService, Task);
  }
}
