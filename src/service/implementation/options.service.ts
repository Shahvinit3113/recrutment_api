import { inject, injectable } from 'inversify';
import { TYPES } from '@/core/container/types';
import { Options } from '@/data/entities/options';
import { TableNames } from '@/database/tables';
import { IUnitOfWork } from '@/repository';
import { CallerService } from '../caller/caller.service';
import { BaseService } from '../base/base.service';

@injectable()
export class OptionsService extends BaseService<Options> {
  constructor(
    @inject(TYPES.UnitOfWork) unitOfWork: IUnitOfWork,
    @inject(TYPES.Caller) callerService: CallerService
  ) {
    super(unitOfWork, callerService, TableNames.Options, Options);
  }
}
