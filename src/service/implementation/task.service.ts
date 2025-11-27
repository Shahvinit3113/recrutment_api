import { Task } from "@/data/entities/task";
import { VmService } from "../vm/vm.service";
import { Filter } from "@/data/filters/filter";
import { Result } from "@/data/response/response";
import { inject, injectable } from "inversify";
import { TYPES } from "@/core/container/types";
import { Repository } from "@/repository/base/repository";
import { CallerService } from "../caller/caller.service";

injectable();
export class TaskService extends VmService<Task, Task, Filter, Result<Task>> {
  constructor(
    @inject(TYPES.Repository) repository: Repository,
    @inject(TYPES.Caller) callerService: CallerService
  ) {
    super(repository.Task, callerService, Task);
  }

  /**
   * Get all tasks data as filtered
   * @param columns
   * @param filter
   * @returns
   */
  override async getAllAsync(
    columns?: (keyof Task)[] | undefined,
    filter?: Filter | undefined
  ): Promise<Result<Task>> {
    const [contentResult] = await this._repository.count([
      this._callerService.tenantId,
    ]);

    return Result.toPagedResult(
      filter?.Page || 1,
      filter?.PageSize || 20,
      contentResult.TotalRecords,
      await this._repository.getAll(
        [this._callerService.tenantId],
        [
          "Uid",
          "Name",
          "Description",
          "UserName",
          "Stack",
          "StartDate",
          "EndDate",
          "Status",
        ],
        filter
      )
    );
  }
}
