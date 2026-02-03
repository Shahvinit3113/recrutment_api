import { FormTemplate } from "@/data/entities/form_template";
import { BaseRepository } from "../base/base.repository";
import { DatabaseConnection } from "@/db/connection/connection";
import { Tables } from "@/db/helper/table";
import { TableNames } from "@/database";

export class FormTemplateRepository extends BaseRepository<FormTemplate> {
  constructor(db: DatabaseConnection) {
    super(db, Tables.FormTemplate);
  }

  /**
   * Complex query that returns the template with nested sections and fields as direct columns
   */
  selectByIdQuery(columns?: (keyof FormTemplate)[] | undefined): string {
    return `
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
  }
}
