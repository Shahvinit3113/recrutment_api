import { inject, injectable } from "inversify";
import { VmService } from "../vm/vm.service";
import { TYPES } from "@/core/container/types";
import { User } from "@/data/entities/user";
import { UserRepository } from "@/repository/user.repository";
import { Result } from "@/data/response/response";
import { Filter } from "@/data/filters/filter";
import { CallerService } from "../caller/caller.service";

@injectable()
export class UserService extends VmService<User, User, Filter, Result<User>> {
  constructor(
    @inject(TYPES.UserRepository) _repository: UserRepository,
    @inject(TYPES.Caller) _callerService: CallerService
  ) {
    super(_repository, _callerService, User);
  }
}
