import { IBaseEntities } from "@/data/entities/base-entities";

/**
 * Base query generator for database operations
 * @template T - Entity type that extends IBaseEntities
 */
export class BaseQueries<T extends IBaseEntities> {
  private table: string;

  /**
   * Initializes a new instance of base queries
   * @param table Name of the database table
   */
  constructor(table: string) {
    this.table = table;
  }

  /**
   * Generates a query to select all active records for an organization
   * @param columns Optional array of column names to select
   * @returns SQL query string
   */
  seletAllQuery(columns?: (keyof T)[]): string {
    const fields = columns?.length ? columns.join(", ") : "*";
    return `SELECT ${fields} FROM ${this.table} WHERE IsDeleted = 0 AND OrgId = ?`;
  }

  /**
   * Generates a query to select a record by its unique identifier
   * @param columns Optional array of column names to select
   * @returns SQL query string
   */
  selectByIdQuery(columns?: (keyof T)[]): string {
    const fields = columns?.length ? columns.join(", ") : "*";
    return `SELECT ${fields} FROM ${this.table} WHERE Uid = ? AND OrgId = ? AND IsDeleted = 0`;
  }

  /**
   * Generates an insert query for a new record
   * @param entity Entity to be inserted
   * @returns SQL query string
   */
  insertQuery(entity: T): string {
    const keys = Object.keys(entity).filter(
      (k) => entity[k as keyof T] !== undefined
    );
    const placeholders = keys.map(() => "?").join(",");
    return `INSERT INTO ${this.table} (${keys.join(
      ","
    )}) VALUES (${placeholders})`;
  }

  /**
   * Generates an update query for an existing record
   * @param entity Entity with updated values
   * @returns SQL query string
   */
  putQuery(entity: T): string {
    const keys = Object.keys(entity).filter(
      (k) => k !== "Uid" && entity[k as keyof T] !== undefined
    );
    const setClause = keys.map((k) => `${k} = ?`).join(",");
    return `UPDATE ${this.table} SET ${setClause} WHERE Uid = ?`;
  }

  /**
   * Generates a query for soft deleting a record
   * @returns SQL query string
   */
  softDeleteQuery(): string {
    return `UPDATE ${this.table} SET IsDeleted = 1 WHERE Uid = ?`;
  }

  /**
   * Generates a query for permanently deleting a record
   * @returns SQL query string
   */
  hardDeleteQuery(): string {
    return `DELETE FROM ${this.table} WHERE Uid = ?`;
  }

  /**
   * Generates a query for soft deleting multiple records
   * @returns SQL query string
   */
  softDeleteManyQuery(): string {
    return `UPDATE ${this.table} SET IsDeleted = 1, DeletedOn = ? WHERE Uid IN (?)`;
  }

  /**
   * Generates a query for permanently deleting multiple records
   * @returns SQL query string
   */
  hardDeleteManyQuery(): string {
    return `DELETE FROM ${this.table} WHERE Uid IN (?)`;
  }
}
