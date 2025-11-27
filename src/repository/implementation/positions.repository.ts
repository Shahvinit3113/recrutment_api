import { Positions } from "@/data/entities/positions";
import { BaseRepository } from "../base/base.repository";
import { DatabaseConnection } from "@/db/connection/connection";
import { Tables } from "@/db/helper/table";
import { Filter } from "@/data/filters/filter";

export class PositionsRepository extends BaseRepository<Positions> {
  constructor(db: DatabaseConnection) {
    super(db, Tables.Positions);
  }

  /**
   * Generates a query to select all active records for an organization
   * @param columns Optional array of column names to select
   * @returns SQL query string
   */
  override seletAllQuery(
    columns?: (keyof Positions)[] | undefined,
    filter?: Filter
  ): string {
    let query = `SELECT P.*, D.\`Name\` AS Department FROM ${Tables.Positions} AS P LEFT JOIN ${Tables.Department} AS D ON P.\`DepartmentId\` = D.\`Uid\` WHERE P.\`IsDeleted\` = 0 AND P.\`OrgId\` = ?`;
    if (filter?.SortBy) {
      const sortOrder = filter.SortOrder || "DESC";
      query += ` ORDER BY P.${filter.SortBy} ${sortOrder}`;
    }

    // Add pagination if specified in filter
    if (filter?.Page && filter?.PageSize) {
      query += this.buildPaginationClause(filter);
    }
    return query;
  }

  /**
   * Generates a query to select a record by its unique identifier
   * @param columns Optional array of column names to select
   * @returns SQL query string
   */
  override selectByIdQuery(columns?: (keyof Positions)[] | undefined): string {
    return `SELECT P.*, D.\`Name\` AS Department FROM ${Tables.Positions} AS P LEFT JOIN ${Tables.Department} AS D ON P.\`DepartmentId\` = D.\`Uid\` WHERE P.\`Uid\` = ? AND P.\`OrgId\` = ? AND P.\`IsDeleted\` = 0`;
  }
}
