import { inject, injectable } from 'inversify';
import { TYPES } from '@/core/container/types';
import { Positions } from '@/data/entities/positions';
import { TableNames } from '@/database/tables';
import { IUnitOfWork } from '@/repository/interfaces';
import { CallerService } from '../caller/caller.service';
import { BaseService } from '../base/base.service';
import { Result } from '@/data/response/response';

@injectable()
export class PositionsService extends BaseService<Positions> {
  constructor(
    @inject(TYPES.UnitOfWork) unitOfWork: IUnitOfWork,
    @inject(TYPES.Caller) callerService: CallerService
  ) {
    super(unitOfWork, callerService, TableNames.Position, Positions);
  }

  /**
   * Get all public positions for an organization
   * Used by public application forms
   */
  async getAllPublicPositions(orgId: string) {
    const data = await this.repository.findAll(orgId, [
      'Uid',
      'ApplicationTemplateId',
      'Name',
      'OrgId',
      'DepartmentId',
    ]);

    return Result.toEntityResult(data);
  }
}
