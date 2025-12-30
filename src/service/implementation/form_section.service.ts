import { inject } from "inversify";
import { VmService } from "../vm/vm.service";
import { Filter } from "@/data/filters/filter";
import { TYPES } from "@/core/container/types";
import { Repository } from "@/repository/base/repository";
import { CallerService } from "../caller/caller.service";
import { FormSection } from "@/data/entities/form_section";
import { Service } from "@/core/container/auto-register";

@Service({ scope: 'request' })
export class FormSectionService extends VmService<FormSection, FormSection, Filter> {
  constructor(
    @inject(TYPES.Repository) repository: Repository,
    @inject(TYPES.Caller) callerService: CallerService
  ) {
    super(repository.FormSection, callerService, FormSection, repository);
  }
}
