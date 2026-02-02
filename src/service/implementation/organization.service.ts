import { inject, injectable } from 'inversify';
import { TYPES } from '@/core/container/types';
import { Organization } from '@/data/entities/organization';
import { TableNames } from '@/database/tables';
import { IUnitOfWork } from '@/repository/interfaces';
import { CallerService } from '../caller/caller.service';
import { BaseService } from '../base/base.service';

@injectable()
export class OrganizationService extends BaseService<Organization> {
  constructor(
    @inject(TYPES.UnitOfWork) unitOfWork: IUnitOfWork,
    @inject(TYPES.Caller) callerService: CallerService
  ) {
    super(unitOfWork, callerService, TableNames.Organization, Organization);
  }
}
