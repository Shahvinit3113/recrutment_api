import { Organization } from "@/data/entities/organization";
import { DatabaseConnection } from "@/db/connection/connection";
import { BaseRepository } from "../base/base.repository";
import { Tables } from "@/db/helper/table";

export class OrganizationRepository extends BaseRepository<Organization> {
  constructor(db: DatabaseConnection) {
    super(db, Tables.Organization);
  }

  override seletAllQuery(columns?: (keyof Organization)[]): string {
    const fields = columns?.length ? columns.join(", ") : "*";
    return `SELECT ${fields} FROM ${Tables.Organization} WHERE IsDeleted = 0`;
  }
}
