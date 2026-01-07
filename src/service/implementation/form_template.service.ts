import { FormTemplate } from "@/data/entities/form_template";
import { VmService } from "../vm/vm.service";
import { Filter } from "@/data/filters/filter";
import { Result } from "@/data/response/response";
import { inject, injectable } from "inversify";
import { TYPES } from "@/core/container/types";
import { Repository } from "@/repository/base/repository";
import { CallerService } from "../caller/caller.service";
import { FormTemplateResult } from "@/data/results/form_template_result";

@injectable()
export class FormTemplateService extends VmService<
  FormTemplate,
  FormTemplate,
  Filter,
  Result<FormTemplateResult>
> {
  constructor(
    @inject(TYPES.Repository) repository: Repository,
    @inject(TYPES.Caller) callerService: CallerService
  ) {
    super(repository.FormTemplate, callerService, FormTemplate);
  }

  /**
   * Get form template by id for public access
   * @param templateId
   * @param orgId
   * @returns
   */
  async getFormTemplateByIdForPublic(templateId: string, orgId: string) {
    const data = (await this._repository.getById(templateId, [
      orgId,
    ])) as FormTemplateResult;
    return Result.toEntityResult<FormTemplateResult>(data);
  }
}
