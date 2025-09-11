import { inject, injectable } from "inversify";
import { VmService } from "../vm/vm.service";
import { TYPES } from "@/core/container/types";
import { User } from "@/data/entities/user";
import { Respository } from "@/repository/implementation/repository";
import { Result } from "@/data/response/response";
import { Filter } from "@/data/filters/filter";
import { CallerService } from "../caller/caller.service";

@injectable()
export class UserService extends VmService<User, User, Filter, Result<User>> {
  constructor(
    @inject(TYPES.Resposity) _repository: Respository<User>,
    @inject(TYPES.Caller) _callerService: CallerService
  ) {
    super(_repository, _callerService, User);
  }
}
