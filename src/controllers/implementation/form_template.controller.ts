import { FormTemplate } from "@/data/entities/form_template";
import { BaseController } from "../base/base.controller";
import { Filter } from "@/data/filters/filter";
import { inject } from "inversify";
import { authenticate } from "@/middleware/implementation/auth";
import { TYPES } from "@/core/container/types";
import { FormTemplateService } from "@/service/implementation/form_template.service";
import { FormTemplateResult } from "@/data/results/form_template_result";
import { AutoController } from "@/core/container/auto-register";

@AutoController("/formTemplate", [authenticate])
export class FormTemplateController extends BaseController<FormTemplate, FormTemplate, Filter> {
  constructor(
    @inject(TYPES.FormTemplateService) formTemplateService: FormTemplateService
  ) {
    super(formTemplateService);
  }
}
