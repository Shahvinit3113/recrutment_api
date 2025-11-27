import { Department } from "@/data/entities/department";
import { VmService } from "../vm/vm.service";
import { Filter } from "@/data/filters/filter";
import { Result } from "@/data/response/response";
import { TYPES } from "@/core/container/types";
import { Repository } from "@/repository/base/repository";
import { inject, injectable } from "inversify";
import { CallerService } from "../caller/caller.service";

@injectable()
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

  /**
   * Get all department records as filtered
   * @param columns
   * @param filter
   * @returns
   */
  override async getAllAsync(
    columns?: (keyof Department)[] | undefined,
    filter?: Filter | undefined
  ): Promise<Result<Department>> {
    const [contentResult] = await this._repository.count([
      this._callerService.tenantId,
    ]);

    return Result.toPagedResult(
      filter?.Page || 1,
      filter?.PageSize || 20,
      contentResult.TotalRecords,
      await this._repository.getAll(
        [this._callerService.tenantId],
        ["Uid", "Name", "Description"],
        filter
      )
    );
  }
}
