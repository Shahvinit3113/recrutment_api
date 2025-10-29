import { Organization } from "@/data/entities/organization";
import { DatabaseConnection } from "@/db/connection/connection";
import { BaseRepository } from "../base/base.repository";
import { Tables } from "@/db/helper/table";

export class OrganizationRepository extends BaseRepository<Organization> {
  constructor(db: DatabaseConnection) {
    super(db, Tables.Organization);
  }
}
