import { inject, injectable } from 'inversify';
import { TYPES } from '@/core/container/types';
import { Department } from '@/data/entities/department';
import { TableNames } from '@/database/tables';
import { IUnitOfWork } from '@/repository/interfaces';
import { CallerService } from '../caller/caller.service';
import { BaseService } from '../base/base.service';

@injectable()
export class DepartmentService extends BaseService<Department> {
  constructor(
    @inject(TYPES.UnitOfWork) unitOfWork: IUnitOfWork,
    @inject(TYPES.Caller) callerService: CallerService
  ) {
    super(unitOfWork, callerService, TableNames.Department, Department);
  }
}
