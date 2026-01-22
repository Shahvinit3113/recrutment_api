import { Organization } from "@/data/entities/organization";
import { BaseController } from "../base/base.controller";
import { Filter } from "@/data/filters/filter";
import { Result } from "@/data/response/response";
import { inject, injectable } from "inversify";
import { TYPES } from "@/core/container/types";
import { OrganizationService } from "@/service/implementation/organization.service";
import { controller } from "@/core/decorators/controller.decorator";
import { authenticate } from "@/middleware/implementation/auth";
import { initializeCaller } from "@/middleware/implementation/callerInit";

@injectable()
@controller("/organization", [initializeCaller, authenticate])
export class OrganizationController extends BaseController<
  Organization,
  Organization,
  Filter,
  Result<Organization>
> {
  constructor(
    @inject(TYPES.OrganizationService) organizationService: OrganizationService,
  ) {
    super(organizationService);
  }
}
