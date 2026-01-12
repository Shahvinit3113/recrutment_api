import { Application } from "@/data/entities/application";
import { VmService } from "../vm/vm.service";
import { Filter } from "@/data/filters/filter";
import { Result } from "@/data/response/response";
import { inject, injectable } from "inversify";
import { TYPES } from "@/core/container/types";
import { Repository } from "@/repository/base/repository";
import { CallerService } from "../caller/caller.service";
import { Utility } from "@/core/utils/common.utils";
import { ValidationError } from "@/middleware/errors/validation.error";

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

  /**
   * Validates the entity before adding
   * @param entity
   */
  override async validateAdd(entity: Application): Promise<void> {
    if (entity.MetaData != null && entity?.MetaData?.trim()?.length > 0) {
      const isValid = Utility.isValidJson(entity.MetaData);
      if (!isValid) {
        throw new ValidationError("Invalid JSON in MetaData");
      }
    }
  }
  //#endregion

  //#region
  /**
   * Validates the entity before updating
   * @param entity
   */
  override async validateUpdate(entity: Application): Promise<void> {
    if (entity.MetaData != null && entity?.MetaData?.trim()?.length > 0) {
      const isValid = Utility.isValidJson(entity.MetaData);
      if (!isValid) {
        throw new ValidationError("Invalid JSON in MetaData");
      }
    }
  }
  //#endregion
}
