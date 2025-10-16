import { Organization } from "@/data/entities/organization";
import { BaseQueries } from "./base/base.query";
import { Tables } from "../helper/table";

export class OrganizationQuery extends BaseQueries<Organization> {
  constructor() {
    super(Tables.Organization);
  }
}
