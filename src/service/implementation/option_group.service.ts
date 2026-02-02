import { inject, injectable } from 'inversify';
import { TYPES } from '@/core/container/types';
import { OptionGroup } from '@/data/entities/option_group';
import { TableNames } from '@/database/tables';
import { IUnitOfWork } from '@/repository';
import { CallerService } from '../caller/caller.service';
import { BaseService } from '../base/base.service';

@injectable()
export class OptionGroupService extends BaseService<OptionGroup> {
  constructor(
    @inject(TYPES.UnitOfWork) unitOfWork: IUnitOfWork,
    @inject(TYPES.Caller) callerService: CallerService
  ) {
    super(unitOfWork, callerService, TableNames.OptionGroup, OptionGroup);
  }
}
