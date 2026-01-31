import { EmailTemplateType } from "../enums/email_template";
import { BaseEntities } from "./base-entities";

export class EmailTemplate extends BaseEntities {
  Name: string = "";
  Description: string = "";
  Content: string = "";
  Type: EmailTemplateType = EmailTemplateType.Test;
}
