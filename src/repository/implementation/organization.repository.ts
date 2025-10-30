import { Organization } from "@/data/entities/organization";
import { DatabaseConnection } from "@/db/connection/connection";
import { BaseRepository } from "../base/base.repository";
import { Tables } from "@/db/helper/table";

/**
 * Repository for managing organization data
 * Provides specialized data access operations for organizations
 */
export class OrganizationRepository extends BaseRepository<Organization> {
  /**
   * Initializes a new organization repository
   * @param db Database connection instance
   */
  constructor(db: DatabaseConnection) {
    super(db, Tables.Organization);
  }

  /**
   * Overrides the base select all query to remove organization filtering
   * @param columns Optional array of columns to select
   * @returns SQL query string for selecting all organizations
   */
  override seletAllQuery(columns?: (keyof Organization)[]): string {
    const fields = columns?.length ? columns.join(", ") : "*";
    return `SELECT ${fields} FROM ${Tables.Organization} WHERE IsDeleted = 0`;
  }
}
