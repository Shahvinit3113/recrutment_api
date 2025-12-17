import { FormTemplate } from "@/data/entities/form_template";
import { BaseRepository } from "../base/base.repository";
import { DatabaseConnection } from "@/db/connection/connection";
import { Tables } from "@/db/helper/table";

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
                  'OptionId', ff.OptionId,
                  'HelpText', ff.HelpText,
                  'IsRequired', ff.IsRequired,
                  'DefaultValue', ff.DefaultValue,
                  'MinLength', ff.MinLength,
                  'MaxLength', ff.MaxLength,
                  'Pattern', ff.Pattern,
                  'SortOrder', ff.SortOrder,
                  'IsVisible', ff.IsVisible,
                  'Width', ff.Width
                )
              )
              FROM ${Tables.FormField} ff
              WHERE ff.FormSectionId = fs.Uid AND ff.IsDeleted = 0
              ORDER BY ff.SortOrder
            )
          )
        )
        FROM ${Tables.FormSection} fs
        WHERE fs.FormTemplateId = ft.Uid AND fs.IsDeleted = 0
        ORDER BY fs.SortOrder
      ) AS Sections
    FROM ${Tables.FormTemplate} ft
    WHERE ft.Uid = ? AND OrgId = ? AND IsDeleted = 0;
  `;
  }
}
