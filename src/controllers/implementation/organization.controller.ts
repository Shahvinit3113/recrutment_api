import { Organization } from "@/data/entities/organization";
import { BaseController } from "../base/base.controller";
import { Filter } from "@/data/filters/filter";
import { inject } from "inversify";
import { TYPES } from "@/core/container/types";
import { OrganizationService } from "@/service/implementation/organization.service";
import { authenticate } from "@/middleware/implementation/auth";
import { AutoController } from "@/core/container/auto-register";

@AutoController("/organization", [authenticate])
export class OrganizationController extends BaseController<Organization, Organization, Filter> {
  constructor(
    @inject(TYPES.OrganizationService) organizationService: OrganizationService
  ) {
    super(organizationService);
  }
}
