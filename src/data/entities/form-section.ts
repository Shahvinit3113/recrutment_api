import { BaseEntities } from "./base-entities";

export class FormSection extends BaseEntities {
  FormTemplateId: string = "";
  Name: string = "";
  Description: string | null = null;
  ShowTitle: boolean = true;
  Order: number = 0;
}
