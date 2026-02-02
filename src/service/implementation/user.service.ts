import { inject, injectable } from 'inversify';
import { TYPES } from '@/core/container/types';
import { User } from '@/data/entities/user';
import { TableNames } from '@/database/tables';
import { IUnitOfWork } from '@/repository/interfaces';
import { CallerService } from '../caller/caller.service';
import { BaseService } from '../base/base.service';
import { ValidationError } from '@/middleware/errors/validation.error';

@injectable()
export class UserService extends BaseService<User> {
  constructor(
    @inject(TYPES.UnitOfWork) unitOfWork: IUnitOfWork,
    @inject(TYPES.Caller) callerService: CallerService
  ) {
    super(unitOfWork, callerService, TableNames.User, User);
  }

  /**
   * Validate before creating - check for duplicate email
   */
  override async validateAdd(entity: User): Promise<void> {
    await this.validateDuplicateUser(entity, null);
  }

  /**
   * Validate before updating - check for duplicate email
   */
  override async validateUpdate(entity: User): Promise<void> {
    await this.validateDuplicateUser(entity, entity.Uid);
  }

  /**
   * Get user by email
   */
  async getByEmail(email: string): Promise<User | null> {
    if (!email?.length) return null;
    return await this.repository.findOneWhere({ Email: email });
  }

  /**
   * Check for duplicate email
   */
  private async validateDuplicateUser(
    user: User,
    id: string | null = null
  ): Promise<void> {
    const duplicateUser = await this.getByEmail(user.Email);

    if (duplicateUser == null || !duplicateUser) {
      return;
    }

    if (id?.length && duplicateUser.Uid != id) {
      throw new ValidationError('User with same email already exists');
    }
  }
}
