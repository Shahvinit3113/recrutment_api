import { FormTemplate } from "@/data/entities/form-template";
import { VmService } from "../vm/vm.service";
import { Filter } from "@/data/filters/filter";
import { Result } from "@/data/response/response";
import { inject, injectable } from "inversify";
import { TYPES } from "@/core/container/types";
import { Repository } from "@/repository/base/repository";
import { CallerService } from "../caller/caller.service";

@injectable()
export class FormTemplateService extends VmService<
  FormTemplate,
  FormTemplate,
  Filter,
  Result<FormTemplate>
> {
  constructor(
    @inject(TYPES.Repository) repository: Repository,
    @inject(TYPES.Caller) callerService: CallerService
  ) {
    super(repository.FormTemplate, callerService, FormTemplate);
  }
}
