import { inject, injectable } from "inversify";
import { VmService } from "../vm/vm.service";
import { TYPES } from "@/core/container/types";
import { User } from "@/data/entities/user";
import { Result } from "@/data/response/response";
import { Filter } from "@/data/filters/filter";
import { CallerService } from "../caller/caller.service";
import { Repository } from "@/repository/base/repository";
import { UserRepository } from "@/repository/implementation/user.repository";
import { ValidationError } from "@/middleware/errors/validation.error";
import { Role } from "@/data/enums/role";
import { DbContext } from "@/db/context/db.context";

@injectable()
export class UserService extends VmService<User, User, Filter, Result<User>> {
  protected declare _repository: UserRepository;

  //#region Constructor
  constructor(
    @inject(TYPES.Repository) _repository: Repository,
    @inject(TYPES.Caller) _callerService: CallerService,
    @inject(TYPES.DbContext) private readonly _dbContext: DbContext
  ) {
    super(_repository.User, _callerService, User);
  }

  //#region Add
  public override async validateAdd(entity: User): Promise<void> {
    await this.validateDuplicateUser(entity, null);
  }

  //#region Update
  public override async validateUpdate(entity: User): Promise<void> {
    await this.validateDuplicateUser(entity, entity.Uid);
  }

  /**
   * Example 1: Simple query with explicit filtering
   */
  async getActiveUsers(): Promise<User[]> {
    const tenantId = this._callerService.tenantId;
    return await this._dbContext.Users
      .where(u => u.OrgId === tenantId && !u.IsDeleted && u.IsActive === true)
      .orderByDescending(u => u.CreatedOn)
      .take(10)
      .execute();
  }

  /**
   * Example 2: Query with JOIN
   * Joins users with departments to get user details with department info
   */
  async getUsersWithDepartments(): Promise<any[]> {
    const tenantId = this._callerService.tenantId;

    return await this._dbContext.Users
      .join("departments", "users.DeptId = departments.Uid")
      .where(u => u.OrgId === tenantId && !u.IsDeleted)
      .select(u => ({
        UserId: u.Uid,
        UserName: u.Email,
        IsActive: u.IsActive
        // Department fields will be available in the result
      }))
      .execute();
  }

  /**
   * Example 3: LEFT JOIN with projection
   */
  async getUsersWithOptionalProfiles(): Promise<any[]> {
    const tenantId = this._callerService.tenantId;

    return await this._dbContext.Users
      .leftJoin("user_profiles", "users.Uid = user_profiles.UserId")
      .where(u => u.OrgId === tenantId)
      .orderBy(u => u.Email)
      .execute();
  }

  /**
   * Example 4: Get users by role with filtering
   */
  async getUsersByRole(role: Role): Promise<User[]> {
    const tenantId = this._callerService.tenantId;
    const roleValue = role;

    return await this._dbContext.Users
      .where(u => u.OrgId === tenantId && !u.IsDeleted)
      .where(u => u.Role === roleValue)
      .orderBy(u => u.Email)
      .execute();
  }

  /**
   * Example 5: Find single user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    const tenantId = this._callerService.tenantId;
    const emailValue = email;

    return await this._dbContext.Users
      .where(u => u.OrgId === tenantId && u.Email === emailValue && !u.IsDeleted)
      .first();
  }

  /**
   * Example 6: Pagination
   */
  async getUsersPaginated(page: number, pageSize: number): Promise<User[]> {
    const tenantId = this._callerService.tenantId;
    const pageVal = page;
    const sizeVal = pageSize;

    return await this._dbContext.Users
      .where(u => u.OrgId === tenantId && !u.IsDeleted)
      .orderByDescending(u => u.CreatedOn)
      .skip((pageVal - 1) * sizeVal)
      .take(sizeVal)
      .execute();
  }

  /**
   * Example 7: Get raw SQL for debugging
   */
  debugQuery(): void {
    const tenantId = this._callerService.tenantId;
    const query = this._dbContext.Users
      .where(u => u.OrgId === tenantId && !u.IsDeleted)
      .orderBy(u => u.Email);

    const { sql, params } = query.toSQL();
    console.log('Generated SQL:', sql);
    console.log('Parameters:', params);
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
