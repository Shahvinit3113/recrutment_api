import { UserInfo } from "@/data/entities/user-info";
import { VmService } from "../vm/vm.service";
import { Filter } from "@/data/filters/filter";
import { inject } from "inversify";
import { TYPES } from "@/core/container/types";
import { Repository } from "@/repository/base/repository";
import { CallerService } from "../caller/caller.service";
import { Result } from "@/data/response/response";

export class UserInfoService extends VmService<
  UserInfo,
  UserInfo,
  Filter,
  Result<UserInfo>
> {
  constructor(
    @inject(TYPES.Repository) _repository: Repository,
    @inject(TYPES.Caller) _callerService: CallerService
  ) {
    super(_repository.UserInfo, _callerService, UserInfo);
  }

  //#region Get
  /**
   * Get user's details
   * @returns
   */
  async getUserDetails(): Promise<Result<UserInfo>> {
    return await this.getByIdAsync(this._callerService.infoId);
  }
  //#endregion
}
