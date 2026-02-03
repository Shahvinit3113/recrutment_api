import { inject, injectable } from "inversify";
import { TYPES } from "@/core/container/types";
import { FormTemplate } from "@/data/entities/form_template";
import { TableNames } from "@/database/tables";
import { IUnitOfWork } from "@/repository";
import { CallerService } from "../caller/caller.service";
import { BaseService } from "../base/base.service";
import { Result } from "@/data/response/response";
import {
  FormFieldResult,
  FormSectionResult,
  FormTemplateResult,
} from "@/data/results/form_template_result";

@injectable()
export class FormTemplateService extends BaseService<FormTemplate> {
  constructor(
    @inject(TYPES.UnitOfWork) unitOfWork: IUnitOfWork,
    @inject(TYPES.Caller) callerService: CallerService,
  ) {
    super(unitOfWork, callerService, TableNames.FormTemplate, FormTemplate);
  }

  override async getByIdAsync(
    id: string,
    columns?: (keyof FormTemplate)[] | undefined,
  ): Promise<Result<FormTemplate>> {
    const query = `
      SELECT 
        ft.Uid,
        ft.OrgId,
        ft.Name,
        ft.Description,
        ft.TemplateType,
        (
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
              'Uid', fs.Uid,
              'FormTemplateId', fs.FormTemplateId,
              'OrgId', fs.OrgId,
              'Name', fs.Name,
              'Description', fs.Description,
              'ShowTitle', fs.ShowTitle,
              'SortOrder', fs.SortOrder,
              'Fields', (
                SELECT JSON_ARRAYAGG(
                  JSON_OBJECT(
                    'Uid', ff.Uid,
                    'FormSectionId', ff.FormSectionId,
                    'OrgId', ff.OrgId,
                    'Label', ff.Label,
                    'Name', ff.Name,
                    'Placeholder', ff.Placeholder,
                    'Type', ff.Type,
                    'OptionGroupId', ff.OptionGroupId,
                    'HelpText', ff.HelpText,
                    'IsRequired', ff.IsRequired,
                    'DefaultValue', ff.DefaultValue,
                    'MinLength', ff.MinLength,
                    'MaxLength', ff.MaxLength,
                    'Pattern', ff.Pattern,
                    'SortOrder', ff.SortOrder,
                    'IsVisible', ff.IsVisible,
                    'Width', ff.Width,
                    'Options', (
                      SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                          'Uid', opt.Uid,
                          'OrgId', opt.OrgId,
                          'OptionGroupId', opt.OptionGroupId,
                          'Name', opt.Name,
                          'Value', opt.Value,
                          'SortOrder', opt.SortOrder
                        )
                      )
                      FROM ${TableNames.Options} opt
                      WHERE opt.OptionGroupId = ff.OptionGroupId AND opt.IsDeleted = 0
                      ORDER BY opt.SortOrder
                    )
                  )
                )
                FROM ${TableNames.FormField} ff
                WHERE ff.FormSectionId = fs.Uid AND ff.IsDeleted = 0
                ORDER BY ff.SortOrder
              )
            )
          )
          FROM ${TableNames.FormSection} fs
          WHERE fs.FormTemplateId = ft.Uid AND fs.IsDeleted = 0
          ORDER BY fs.SortOrder
        ) AS Sections
      FROM ${TableNames.FormTemplate} ft
      WHERE ft.Uid = ? AND ft.OrgId = ? AND ft.IsDeleted = 0;
    `;

    const results = await this.unitOfWork.raw<FormTemplateResult[]>(query, [
      id,
      this._callerService.tenantId,
    ]);

    if (results.length === 0) {
      return Result.toEntityResult<FormTemplateResult>(null!);
    }

    const data = results[0];

    return Result.toEntityResult<FormTemplateResult>(data);
  }

  /**
   * Get form template by id for public access
   * Returns template with nested sections, fields, and options in a single query
   */
  async getFormTemplateByIdForPublic(
    templateId: string,
    orgId: string,
  ): Promise<Result<FormTemplateResult | null>> {
    const query = `
      SELECT 
        ft.Uid,
        ft.OrgId,
        ft.Name,
        ft.Description,
        ft.TemplateType,
        (
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
              'Uid', fs.Uid,
              'FormTemplateId', fs.FormTemplateId,
              'OrgId', fs.OrgId,
              'Name', fs.Name,
              'Description', fs.Description,
              'ShowTitle', fs.ShowTitle,
              'SortOrder', fs.SortOrder,
              'Fields', (
                SELECT JSON_ARRAYAGG(
                  JSON_OBJECT(
                    'Uid', ff.Uid,
                    'FormSectionId', ff.FormSectionId,
                    'OrgId', ff.OrgId,
                    'Label', ff.Label,
                    'Name', ff.Name,
                    'Placeholder', ff.Placeholder,
                    'Type', ff.Type,
                    'OptionGroupId', ff.OptionGroupId,
                    'HelpText', ff.HelpText,
                    'IsRequired', ff.IsRequired,
                    'DefaultValue', ff.DefaultValue,
                    'MinLength', ff.MinLength,
                    'MaxLength', ff.MaxLength,
                    'Pattern', ff.Pattern,
                    'SortOrder', ff.SortOrder,
                    'IsVisible', ff.IsVisible,
                    'Width', ff.Width,
                    'Options', (
                      SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                          'Uid', opt.Uid,
                          'OrgId', opt.OrgId,
                          'OptionGroupId', opt.OptionGroupId,
                          'Name', opt.Name,
                          'Value', opt.Value,
                          'SortOrder', opt.SortOrder
                        )
                      )
                      FROM ${TableNames.Options} opt
                      WHERE opt.OptionGroupId = ff.OptionGroupId AND opt.IsDeleted = 0
                      ORDER BY opt.SortOrder
                    )
                  )
                )
                FROM ${TableNames.FormField} ff
                WHERE ff.FormSectionId = fs.Uid AND ff.IsDeleted = 0
                ORDER BY ff.SortOrder
              )
            )
          )
          FROM ${TableNames.FormSection} fs
          WHERE fs.FormTemplateId = ft.Uid AND fs.IsDeleted = 0
          ORDER BY fs.SortOrder
        ) AS Sections
      FROM ${TableNames.FormTemplate} ft
      WHERE ft.Uid = ? AND ft.OrgId = ? AND ft.IsDeleted = 0;
    `;

    const results = await this.unitOfWork.raw<FormTemplateResult[]>(query, [
      templateId,
      orgId,
    ]);

    if (results.length === 0) {
      return Result.toEntityResult<FormTemplateResult | null>(null);
    }

    const data = results[0];

    return Result.toEntityResult<FormTemplateResult>(data);
  }
}
