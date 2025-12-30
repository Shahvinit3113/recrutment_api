import { inject } from "inversify";
import { VmService } from "../vm/vm.service";
import { TYPES } from "@/core/container/types";
import { User } from "@/data/entities/user";
import { Filter } from "@/data/filters/filter";
import { CallerService } from "../caller/caller.service";
import { Repository } from "@/repository/base/repository";
import { UserRepository } from "@/repository/implementation/user.repository";
import { ValidationError } from "@/middleware/errors/validation.error";
import { Service } from "@/core/container/auto-register";

@Service({ scope: 'request' })
export class UserService extends VmService<User, User, Filter> {
  protected declare _repository: UserRepository;

  //#region Constructor
  constructor(
    @inject(TYPES.Repository) _repository: Repository,
    @inject(TYPES.Caller) _callerService: CallerService
  ) {
    super(_repository.User, _callerService, User, _repository);
  }

  //#region Add
  public override async validateAdd(entity: User): Promise<void> {
    await this.validateDuplicateUser(entity, null);
  }

  //#region Update
  public override async validateUpdate(entity: User): Promise<void> {
    await this.validateDuplicateUser(entity, entity.Uid);
  }

  //#region Private Functions
  /**
   *
   * @param user
   * @param id
   * @returns
   */
  private async validateDuplicateUser(user: User, id: string | null = null) {
    const duplicateUser = await this._repository.getByEmail(user.Email);

    if (duplicateUser == null || !duplicateUser) {
      return;
    }

    if (id?.length && duplicateUser.Uid != id) {
      throw new ValidationError("User with same email already exists");
    }
  }
}
