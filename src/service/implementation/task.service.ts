import { inject, injectable } from 'inversify';
import { TYPES } from '@/core/container/types';
import { Task } from '@/data/entities/task';
import { TableNames } from '@/database/tables';
import { IUnitOfWork } from '@/repository/interfaces';
import { CallerService } from '../caller/caller.service';
import { BaseService } from '../base/base.service';

@injectable()
export class TaskService extends BaseService<Task> {
  constructor(
    @inject(TYPES.UnitOfWork) unitOfWork: IUnitOfWork,
    @inject(TYPES.Caller) callerService: CallerService
  ) {
    super(unitOfWork, callerService, TableNames.Task, Task);
  }
}
