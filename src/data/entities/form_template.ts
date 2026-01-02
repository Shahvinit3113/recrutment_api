import { FormTemplateType } from "../enums/template_type";
import { BaseEntities } from "./base-entities";

export class FormTemplate extends BaseEntities {
  Name: string = "";
  Description: string | null = null;
  TemplateType: FormTemplateType = FormTemplateType.Application;
}
