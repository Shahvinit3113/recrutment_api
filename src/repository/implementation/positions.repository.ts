import { Positions } from "@/data/entities/positions";
import { BaseRepository } from "../base/base.repository";
import { DatabaseConnection } from "@/db/connection/connection";
import { Tables } from "@/db/helper/table";

export class PositionsRepository extends BaseRepository<Positions> {
  constructor(db: DatabaseConnection) {
    super(db, Tables.Positions);
  }

  /**
   * Generates a query to select all active records for an organization
   * @param columns Optional array of column names to select
   * @returns SQL query string
   */
  override seletAllQuery(columns?: (keyof Positions)[] | undefined): string {
    return `SELECT P.*, D.\`Name\` AS Department FROM ${Tables.Positions} AS P LEFT JOIN ${Tables.Department} AS D ON P.\`DepartmentId\` = D.\`Uid\` WHERE P.\`IsDeleted\` = 0 AND P.\`OrgId\` = ?`;
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
