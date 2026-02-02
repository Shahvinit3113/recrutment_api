import { FormField } from "../entities/form_field";
import { FormSection } from "../entities/form_section";
import { FormTemplate } from "../entities/form_template";
import { Options } from "../entities/options";

export class FormTemplateResult extends FormTemplate {
  Sections: FormSectionResult[] = [];
}

export class FormSectionResult extends FormSection {
  Fields: FormFieldResult[] = [];
}

export class FormFieldResult extends FormField {
  Options: Options[] = [];
}
