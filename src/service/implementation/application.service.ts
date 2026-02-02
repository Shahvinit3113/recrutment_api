import { inject, injectable } from 'inversify';
import { TYPES } from '@/core/container/types';
import { Application } from '@/data/entities/application';
import { TableNames } from '@/database/tables';
import { IUnitOfWork } from '@/repository/interfaces';
import { CallerService } from '../caller/caller.service';
import { BaseService } from '../base/base.service';
import { Utility } from '@/core/utils/common.utils';
import { ValidationError } from '@/middleware/errors/validation.error';

@injectable()
export class ApplicationService extends BaseService<Application> {
  constructor(
    @inject(TYPES.UnitOfWork) unitOfWork: IUnitOfWork,
    @inject(TYPES.Caller) callerService: CallerService
  ) {
    super(unitOfWork, callerService, TableNames.Application, Application);
  }

  /**
   * Pre add operation - handles public/anonymous submissions
   */
  override async preAddOperation(
    model: Application,
    entity: Application
  ): Promise<void> {
    await super.preAddOperation(model, entity);

    // For public/anonymous submissions, use provided OrgId or default to anonymous tenant
    entity.OrgId = model.OrgId ?? this._callerService.tenantId;

    // For anonymous callers, use system user ID
    if (this._callerService.isAnonymous) {
      entity.CreatedBy = '00000000-0000-0000-0000-000000000000';
    }
  }

  /**
   * Validates the entity before adding
   */
  override async validateAdd(entity: Application): Promise<void> {
    if (entity.MetaData != null && entity?.MetaData?.trim()?.length > 0) {
      const isValid = Utility.isValidJson(entity.MetaData);
      if (!isValid) {
        throw new ValidationError('Invalid JSON in MetaData');
      }
    }
  }

  /**
   * Validates the entity before updating
   */
  override async validateUpdate(entity: Application): Promise<void> {
    if (entity.MetaData != null && entity?.MetaData?.trim()?.length > 0) {
      const isValid = Utility.isValidJson(entity.MetaData);
      if (!isValid) {
        throw new ValidationError('Invalid JSON in MetaData');
      }
    }
  }
}
