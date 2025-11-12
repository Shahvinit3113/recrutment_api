import { inject, injectable } from "inversify";
import { VmService } from "../vm/vm.service";
import { Filter } from "@/data/filters/filter";
import { Result } from "@/data/response/response";
import { TYPES } from "@/core/container/types";
import { Repository } from "@/repository/base/repository";
import { CallerService } from "../caller/caller.service";
import { FormSection } from "@/data/entities/form_section";

injectable();
export class FormSectionService extends VmService<
  FormSection,
  FormSection,
  Filter,
  Result<FormSection>
> {
  constructor(
    @inject(TYPES.Repository) repository: Repository,
    @inject(TYPES.Caller) callerService: CallerService
  ) {
    super(repository.FormSection, callerService, FormSection);
  }
}
