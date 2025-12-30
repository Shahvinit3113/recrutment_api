import { UserInfo } from "@/data/entities/user-info";
import { VmService } from "../vm/vm.service";
import { Filter } from "@/data/filters/filter";
import { inject } from "inversify";
import { TYPES } from "@/core/container/types";
import { Repository } from "@/repository/base/repository";
import { CallerService } from "../caller/caller.service";
import { SingleResult } from "@/data/response/response";
import { Service } from "@/core/container/auto-register";

@Service({ scope: 'request' })
export class UserInfoService extends VmService<UserInfo, UserInfo, Filter> {
  constructor(
    @inject(TYPES.Repository) _repository: Repository,
    @inject(TYPES.Caller) _callerService: CallerService
  ) {
    super(_repository.UserInfo, _callerService, UserInfo, _repository);
  }

  //#region Get
  /**
   * Get user's details
   * @returns
   */
  async getUserDetails(): Promise<SingleResult<UserInfo>> {
    return await this.getByIdAsync(this._callerService.infoId);
  }
  //#endregion
}
