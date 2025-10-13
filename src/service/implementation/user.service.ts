import { inject, injectable } from "inversify";
import { IVmService, VmService } from "../vm/vm.service";
import { TYPES } from "@/core/container/types";
import { User } from "@/data/entities/user";
import { Result } from "@/data/response/response";
import { Filter } from "@/data/filters/filter";
import { CallerService } from "../caller/caller.service";
import { Repository } from "@/repository/base/repository";

export interface IUserService
  extends IVmService<User, User, Filter, Result<User>> {}

@injectable()
export class UserService
  extends VmService<User, User, Filter, Result<User>>
  implements IUserService
{
  constructor(
    @inject(TYPES.Repository) _repository: Repository,
    @inject(TYPES.Caller) _callerService: CallerService
  ) {
    super(_repository.User, _callerService, User);
  }
}
