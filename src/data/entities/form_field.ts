import { BaseEntities } from "./base-entities";

export class FormField extends BaseEntities {
  FormSectionId: string = "";
  Lable: string = "";
  Name: string = "";
  Placeholder: string | null = null;
  Type: string = "";
  OptionId: string | null = null;
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
