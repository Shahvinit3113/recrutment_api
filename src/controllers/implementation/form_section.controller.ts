import { FormTemplate } from "@/data/entities/form_template";
import { BaseController } from "../base/base.controller";
import { Filter } from "@/data/filters/filter";
import { Result } from "@/data/response/response";
import { inject, injectable } from "inversify";
import { controller } from "@/core/decorators/controller.decorator";
import { authenticate } from "@/middleware/implementation/auth";
import { TYPES } from "@/core/container/types";
import { FormTemplateService } from "@/service/implementation/form_template.service";
import { FormSection } from "@/data/entities/form_section";
import { FormSectionService } from "@/service/implementation/form_section.service";

@injectable()
@controller("/formSection", [authenticate])
export class FormSectionController extends BaseController<
  FormSection,
  FormSection,
  Filter,
  Result<FormSection>
> {
  constructor(
    @inject(TYPES.FormSectionService) formSectionService: FormSectionService
  ) {
    super(formSectionService);
  }
}
