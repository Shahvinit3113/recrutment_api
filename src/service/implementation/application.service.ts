import { Application } from "@/data/entities/application";
import { VmService } from "../vm/vm.service";
import { Filter } from "@/data/filters/filter";
import { Result } from "@/data/response/response";
import { inject, injectable } from "inversify";
import { TYPES } from "@/core/container/types";
import { Repository } from "@/repository/base/repository";
import { CallerService } from "../caller/caller.service";

@injectable()
export class ApplicationService extends VmService<
  Application,
  Application,
  Filter,
  Result<Application>
> {
  constructor(
    @inject(TYPES.Repository) repository: Repository,
    @inject(TYPES.Caller) callerService: CallerService
  ) {
    super(repository.Application, callerService, Application);
  }

  //#region Add
  /**
   * Pre add operation
   * @param model
   * @param entity
   */
  override async preAddOperation(
    model: Application,
    entity: Application
  ): Promise<void> {
    super.preAddOperation(model, entity);
    entity.OrgId = model.OrgId ?? this._callerService.tenantId;
    entity.CreatedBy = "00000000-0000-0000-0000-000000000000"; //system user
  }
  //#endregion
}
