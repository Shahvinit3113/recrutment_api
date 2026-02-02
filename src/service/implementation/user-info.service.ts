import { inject, injectable } from 'inversify';
import { TYPES } from '@/core/container/types';
import { UserInfo } from '@/data/entities/user-info';
import { TableNames } from '@/database/tables';
import { IUnitOfWork } from '@/repository/interfaces';
import { CallerService } from '../caller/caller.service';
import { BaseService } from '../base/base.service';
import { Result } from '@/data/response/response';

@injectable()
export class UserInfoService extends BaseService<UserInfo> {
  constructor(
    @inject(TYPES.UnitOfWork) unitOfWork: IUnitOfWork,
    @inject(TYPES.Caller) callerService: CallerService
  ) {
    super(unitOfWork, callerService, TableNames.UserInfo, UserInfo);
  }

  /**
   * Get current user's details
   */
  async getUserDetails(): Promise<Result<UserInfo>> {
    return await this.getByIdAsync(this._callerService.infoId);
  }
}
