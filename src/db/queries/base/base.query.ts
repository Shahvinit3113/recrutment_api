import { BaseEntities } from "@/data/entities/base-entities";
import { Filter } from "@/data/filters/filter";

/**
 * Base query generator for database operations
 * @template T - Entity type that extends IBaseEntities
 */
export class BaseQueries<T extends BaseEntities> {
  protected table: string;

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
   * @param filter Optional filter object with pagination and sorting
   * @returns SQL query string
   */
  seletAllQuery(columns?: (keyof T)[], filter?: Filter): string {
    const fields = this.buildFieldSelection(columns);
    let query = `SELECT ${fields} FROM ${this.table} WHERE IsDeleted = 0 AND OrgId = ?`;

    // Add sorting if specified in filter
    if (filter?.SortBy) {
      const sortOrder = filter.SortOrder || "DESC";
      query += ` ORDER BY ${filter.SortBy} ${sortOrder}`;
    }

    // Add pagination if specified in filter
    if (filter?.Page && filter?.PageSize) {
      query += this.buildPaginationClause(filter);
    }

    return query;
  }

  /**
   * Build field selection clause
   * @param columns Optional array of column names
   * @returns Comma-separated field names or *
   */
  protected buildFieldSelection(columns?: (keyof T)[]): string {
    return columns?.length ? columns.join(", ") : "*";
  }



  /**
   * Build pagination clause with LIMIT and OFFSET
   * @param filter Filter object with Page and PageSize
   * @returns SQL LIMIT OFFSET clause
   */
  protected buildPaginationClause(filter: Filter): string {
    const page = filter.Page || 1;
    const pageSize = Math.min(filter.PageSize || 20, 100); // Max 100 records
    const offset = (page - 1) * pageSize;
    return ` LIMIT ${pageSize} OFFSET ${offset}`;
  }

  /**
   * Generates a query to count total records for pagination
   * @returns SQL query string for counting records
   */
  countQuery(): string {
    return `SELECT COUNT(*) as TotalRecords FROM ${this.table} WHERE IsDeleted = 0 AND OrgId = ?`;
  }

  /**
   * Generates a query to select a record by its unique identifier
   * @param columns Optional array of column names to select
   * @returns SQL query string
   */
  selectByIdQuery(columns?: (keyof T)[]): string {
    const fields = this.buildFieldSelection(columns);
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
   * Generates a bulk insert query for multiple records
   * @param entities Array of entities to be inserted
   * @returns SQL query string
   */
  insertManyQuery(entities: T[]): string {
    if (!entities.length) {
      throw new Error("Cannot generate insert query for empty array");
    }

    const keys = Object.keys(entities[0]).filter(
      (k) => entities[0][k as keyof T] !== undefined
    );

    const valuePlaceholders = entities
      .map(() => `(${keys.map(() => "?").join(",")})`)
      .join(",");

    return `INSERT INTO ${this.table} (${keys.join(
      ","
    )}) VALUES ${valuePlaceholders}`;
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
   * Generates a bulk update query using CASE statements
   * @param entities Array of entities with updated values
   * @param excludeFields Optional array of field names to exclude from update (Uid is always excluded)
   * @returns SQL query string
   */
  updateManyQuery(entities: T[], excludeFields?: (keyof T)[]): string {
    if (!entities.length) {
      throw new Error("Cannot generate update query for empty array");
    }

    const allFields = Object.keys(entities[0]) as (keyof T)[];
    const fieldsToExclude = new Set([
      ...(excludeFields || []),
      "Uid" as keyof T,
    ]);
    const fields = allFields.filter((field) => !fieldsToExclude.has(field));

    const caseStatements = fields.map((field) => {
      const cases = entities.map(() => "WHEN Uid = ? THEN ?").join(" ");
      return `${String(field)} = CASE ${cases} ELSE ${String(field)} END`;
    });

    const uids = entities.map(() => "?").join(",");

    return `UPDATE ${this.table} SET ${caseStatements.join(
      ", "
    )} WHERE Uid IN (${uids})`;
  }

  /**
   * Generates a bulk upsert query for multiple records
   * @param entities Array of entities to upsert
   * @param uniqueKey The unique constraint column (defaults to 'Uid')
   * @param excludeFromUpdate Optional array of fields to exclude from update clause
   * @returns SQL query string
   */
  upsertManyQuery(
    entities: T[],
    uniqueKey: keyof T = "Uid" as keyof T,
    excludeFromUpdate?: (keyof T)[]
  ): string {
    if (!entities.length) {
      throw new Error("Cannot generate upsert query for empty array");
    }

    const keys = Object.keys(entities[0]).filter(
      (k) => entities[0][k as keyof T] !== undefined
    );

    const valuePlaceholders = entities
      .map(() => `(${keys.map(() => "?").join(",")})`)
      .join(",");

    // Fields to update (exclude unique key, CreatedBy, CreatedOn, and specified fields)
    const excludeSet = new Set([
      uniqueKey,
      ...(excludeFromUpdate || []),
      "CreatedBy" as keyof T,
      "CreatedOn" as keyof T,
    ]);

    const updateFields = keys.filter((k) => !excludeSet.has(k as keyof T));
    const updateClause = updateFields
      .map((k) => `${k} = VALUES(${k})`)
      .join(", ");

    return `INSERT INTO ${this.table} (${keys.join(",")}) 
          VALUES ${valuePlaceholders}
          ON DUPLICATE KEY UPDATE ${updateClause}`;
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
