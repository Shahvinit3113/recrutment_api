import { inject, injectable } from "inversify";
import { VmService } from "../vm/vm.service";
import { FormField } from "@/data/entities/form_field";
import { Filter } from "@/data/filters/filter";
import { Result } from "@/data/response/response";
import { TYPES } from "@/core/container/types";
import { Repository } from "@/repository/base/repository";
import { CallerService } from "../caller/caller.service";

injectable();
export class FormFieldService extends VmService<
  FormField,
  FormField,
  Filter,
  Result<FormField>
> {
  constructor(
    @inject(TYPES.Repository) repository: Repository,
    @inject(TYPES.Caller) callerService: CallerService
  ) {
    super(repository.FormField, callerService, FormField);
  }
}
