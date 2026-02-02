import { inject, injectable } from 'inversify';
import { TYPES } from '@/core/container/types';
import { FormSection } from '@/data/entities/form_section';
import { TableNames } from '@/database/tables';
import { IUnitOfWork } from '@/repository/interfaces';
import { CallerService } from '../caller/caller.service';
import { BaseService } from '../base/base.service';

@injectable()
export class FormSectionService extends BaseService<FormSection> {
  constructor(
    @inject(TYPES.UnitOfWork) unitOfWork: IUnitOfWork,
    @inject(TYPES.Caller) callerService: CallerService
  ) {
    super(unitOfWork, callerService, TableNames.FormSection, FormSection);
  }
}
