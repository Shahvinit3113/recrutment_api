import { inject, injectable } from 'inversify';
import { TYPES } from '@/core/container/types';
import { FormField } from '@/data/entities/form_field';
import { TableNames } from '@/database/tables';
import { CallerService } from '../caller/caller.service';
import { BaseService } from '../base/base.service';
import { Result } from '@/data/response/response';
import { Utility } from '@/core/utils/common.utils';
import { IUnitOfWork } from '@/repository';

@injectable()
export class FormFieldService extends BaseService<FormField> {
  constructor(
    @inject(TYPES.UnitOfWork) unitOfWork: IUnitOfWork,
    @inject(TYPES.Caller) callerService: CallerService
  ) {
    super(unitOfWork, callerService, TableNames.FormField, FormField);
  }

  /**
   * Upsert multiple form fields
   * Creates new fields or updates existing ones based on Uid
   */
  async upsertMultipleFormFields(
    fields: FormField[]
  ): Promise<Result<FormField[]>> {
    if (!fields?.length) {
      return Result.toEntityResult([]);
    }

    const now = new Date();
    const emptyGuid = '00000000-0000-0000-0000-000000000000';

    // Prepare all fields with proper metadata
    const preparedFields = fields.map((f) => ({
      ...this.toFormField(f),
      Uid: f.Uid && f.Uid !== emptyGuid ? f.Uid : Utility.generateUUID(),
      CreatedBy: this._callerService.userId,
      UpdatedBy: this._callerService.userId,
      UpdatedOn: now,
      OrgId: this._callerService.tenantId,
    }));

    // Use transaction for atomic upsert
    const upsertedFields = await this.transaction(async (trx) => {
      const results: FormField[] = [];
      const repo = this.unitOfWork.getTransactionalRepository<FormField>(
        TableNames.FormField,
        trx
      );

      for (const field of preparedFields) {
        // Check if exists
        const existing = await repo.findById(field.Uid, field.OrgId);

        if (existing) {
          // Update
          await repo.update(field.Uid, field);
          results.push({ ...existing, ...field } as FormField);
        } else {
          // Create
          field.CreatedOn = now;
          await repo.create(field as FormField);
          results.push(field as FormField);
        }
      }

      return results;
    });

    return Result.toEntityResult(upsertedFields);
  }

  /**
   * Convert input to FormField with proper defaults
   */
  private toFormField(field: FormField): Partial<FormField> {
    const newField = new FormField();

    newField.FormSectionId = field.FormSectionId;
    newField.Label = field.Label;
    newField.Name = field.Name;
    newField.Placeholder = field.Placeholder;
    newField.Type = field.Type;
    newField.OptionGroupId = field.OptionGroupId;
    newField.HelpText = field.HelpText;
    newField.IsRequired = field.IsRequired;
    newField.DefaultValue = field.DefaultValue;
    newField.MinLength = field.MinLength;
    newField.MaxLength = field.MaxLength;
    newField.Pattern = field.Pattern;
    newField.SortOrder = field.SortOrder;
    newField.IsVisible = field.IsVisible;
    newField.Width = field.Width;

    newField.IsActive = field.IsActive ?? true;
    newField.IsDeleted = field.IsDeleted ?? false;

    newField.UpdatedBy = this._callerService.userId;
    newField.UpdatedOn = new Date();
    newField.OrgId = this._callerService.tenantId;

    return newField;
  }
}
