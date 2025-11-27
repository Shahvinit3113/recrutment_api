import { inject, injectable } from "inversify";
import { VmService } from "../vm/vm.service";
import { FormField } from "@/data/entities/form_field";
import { Filter } from "@/data/filters/filter";
import { Result } from "@/data/response/response";
import { TYPES } from "@/core/container/types";
import { Repository } from "@/repository/base/repository";
import { CallerService } from "../caller/caller.service";
import { Utility } from "@/core/utils/common.utils";

injectable();
export class FormFieldService extends VmService<
  FormField,
  FormField,
  Filter,
  Result<FormField>
> {
  constructor(
    @inject(TYPES.Repository) repository: Repository,
    @inject(TYPES.Caller) callerService: CallerService
  ) {
    super(repository.FormField, callerService, FormField);
  }

  //#region Upsert
  /**
   * Updated FormFieldService using the new upsertMany method
   */
  async upsertMultipleFormFields(
    fields: FormField[]
  ): Promise<Result<FormField[]>> {
    if (!fields?.length) {
      return Result.toEntityResult([]);
    }

    const now = new Date();
    const emptyGuid = "00000000-0000-0000-0000-000000000000";

    const preparedFields = fields.map((f) => ({
      ...this.toFormField(f),
      Uid: f.Uid && f.Uid !== emptyGuid ? f.Uid : Utility.generateUUID(),
      CreatedBy: this._callerService.userId,
      UpdatedBy: this._callerService.userId,
      UpdatedOn: now,
      OrgId: this._callerService.tenantId,
    }));

    const upsertedFields = await this._repository.upsertMany(preparedFields);

    return Result.toEntityResult(upsertedFields);
  }
  //#endregion

  //#region Private Functions
  /**
   *
   * @param field
   * @returns
   */
  private toFormField(field: FormField) {
    const newField = new FormField();

    newField.FormSectionId = field.FormSectionId;
    newField.Label = field.Label;
    newField.Name = field.Name;
    newField.Placeholder = field.Placeholder;
    newField.Type = field.Type;
    newField.OptionId = field.OptionId;
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
  //#endregion
}
