import { Organization } from "@/data/entities/organization";
import { VmService } from "../vm/vm.service";
import { Filter } from "@/data/filters/filter";
import { inject } from "inversify";
import { TYPES } from "@/core/container/types";
import { Repository } from "@/repository/base/repository";
import { CallerService } from "../caller/caller.service";
import { Service } from "@/core/container/auto-register";

@Service({ scope: 'request' })
export class OrganizationService extends VmService<Organization, Organization, Filter> {
  constructor(
    @inject(TYPES.Repository) repository: Repository,
    @inject(TYPES.Caller) callerService: CallerService
  ) {
    super(repository.Organization, callerService, Organization, repository);
  }
}
