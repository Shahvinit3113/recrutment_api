import { FormTemplate } from "@/data/entities/form-template";
import { BaseController } from "../base/base.controller";
import { Filter } from "@/data/filters/filter";
import { Result } from "@/data/response/response";
import { inject, injectable } from "inversify";
import { controller } from "@/core/decorators/controller.decorator";
import { authenticate } from "@/middleware/implementation/auth";
import { TYPES } from "@/core/container/types";
import { FormTemplateService } from "@/service/implementation/form_template.service";

@injectable()
@controller("/formTemplate", [authenticate])
export class FormTemplateController extends BaseController<
  FormTemplate,
  FormTemplate,
  Filter,
  Result<FormTemplate>
> {
  constructor(
    @inject(TYPES.FormTemplateService) formTemplateService: FormTemplateService
  ) {
    super(formTemplateService);
  }
}
