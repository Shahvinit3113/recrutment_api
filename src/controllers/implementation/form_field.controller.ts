import { BaseController } from "../base/base.controller";
import { Filter } from "@/data/filters/filter";
import { Result } from "@/data/response/response";
import { inject, injectable } from "inversify";
import { controller } from "@/core/decorators/controller.decorator";
import { authenticate } from "@/middleware/implementation/auth";
import { TYPES } from "@/core/container/types";
import { FormField } from "@/data/entities/form_field";
import { FormFieldService } from "@/service/implementation/form_field.service";

@injectable()
@controller("/formField", [authenticate])
export class FormFieldController extends BaseController<
  FormField,
  FormField,
  Filter,
  Result<FormField>
> {
  constructor(
    @inject(TYPES.FormFieldService) formFieldService: FormFieldService
  ) {
    super(formFieldService);
  }
}
