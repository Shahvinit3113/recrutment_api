import { FormTemplate } from "@/data/entities/form_template";
import { VmService } from "../vm/vm.service";
import { Filter } from "@/data/filters/filter";
import { inject } from "inversify";
import { TYPES } from "@/core/container/types";
import { Repository } from "@/repository/base/repository";
import { CallerService } from "../caller/caller.service";
import { FormTemplateResult } from "@/data/results/form_template_result";
import { Service } from "@/core/container/auto-register";

@Service({ scope: 'request' })
export class FormTemplateService extends VmService<FormTemplate, FormTemplate, Filter> {
  constructor(
    @inject(TYPES.Repository) repository: Repository,
    @inject(TYPES.Caller) callerService: CallerService
  ) {
    super(repository.FormTemplate, callerService, FormTemplate, repository);
  }
}
