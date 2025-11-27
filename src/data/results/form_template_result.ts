import { FormField } from "../entities/form_field";
import { FormSection } from "../entities/form_section";
import { FormTemplate } from "../entities/form_template";

export class FormTemplateResult extends FormTemplate {
  Sections: FormSectionResult[] = [];
}

export class FormSectionResult extends FormSection {
  Fields: FormField[] = [];
}
