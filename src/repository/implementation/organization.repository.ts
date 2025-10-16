import { Organization } from "@/data/entities/organization";
import { BaseRespository } from "../base/base.repository";
import { OrganizationQuery } from "@/db/queries/organization.query";
import { DatabaseConnection } from "@/db/connection/connection";

export class OrganizationRepository extends BaseRespository<
  Organization,
  OrganizationQuery
> {
  constructor(db: DatabaseConnection) {
    super(db, new OrganizationQuery());
  }
}
