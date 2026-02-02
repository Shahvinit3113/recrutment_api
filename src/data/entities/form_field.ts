import { FieldType } from "../enums/field_type";
import { BaseEntities } from "./base-entities";

export class FormField extends BaseEntities {
  FormSectionId: string = "";
  Label: string = "";
  Name: string = "";
  Type: FieldType = FieldType.Text;
  Placeholder: string | null = null;
  OptionGroupId: string | null = null;
  HelpText: string | null = null;
  IsRequired: boolean = true;
  DefaultValue: string | null = null;
  MinLength: number | null = null;
  MaxLength: number | null = null;
  Pattern: string | null = null;
  SortOrder: number = 0;
  IsVisible: boolean = true;
  Width: number = 100;
}
