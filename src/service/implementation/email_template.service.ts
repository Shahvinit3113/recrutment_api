import { inject, injectable } from 'inversify';
import { TYPES } from '@/core/container/types';
import { EmailTemplate } from '@/data/entities/email_template';
import { TableNames } from '@/database/tables';
import { CallerService } from '../caller/caller.service';
import { BaseService } from '../base/base.service';
import { IUnitOfWork } from '@/repository';

@injectable()
export class EmailTemplateService extends BaseService<EmailTemplate> {
  constructor(
    @inject(TYPES.UnitOfWork) unitOfWork: IUnitOfWork,
    @inject(TYPES.Caller) callerService: CallerService
  ) {
    super(unitOfWork, callerService, TableNames.EmailTemplate, EmailTemplate);
  }
}
