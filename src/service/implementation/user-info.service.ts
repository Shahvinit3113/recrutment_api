import { UserInfo } from "@/data/entities/user-info";
import { IVmService, VmService } from "../vm/vm.service";
import { Filter } from "@/data/filters/filter";
import { inject } from "inversify";
import { TYPES } from "@/core/container/types";
import { Repository } from "@/repository/base/repository";
import { CallerService } from "../caller/caller.service";
import { Result } from "@/data/response/response";

export interface IUserInfoService
  extends IVmService<UserInfo, UserInfo, Filter, Result<UserInfo>> {}

export class UserInfoService
  extends VmService<UserInfo, UserInfo, Filter, Result<UserInfo>>
  implements IUserInfoService
{
  constructor(
    @inject(TYPES.Repository) _repository: Repository,
    @inject(TYPES.Caller) _callerService: CallerService
  ) {
    super(_repository.UserInfo, _callerService, UserInfo);
  }
}
