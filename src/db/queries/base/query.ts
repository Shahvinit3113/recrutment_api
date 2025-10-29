import { IBaseEntities } from "@/data/entities/base-entities";
import { User } from "@/data/entities/user";

// ============================================
// Types & Interfaces
// ============================================

export interface IQueryOptions<T> {
  columns?: (keyof T)[];
  orderBy?: { column: keyof T; direction: "ASC" | "DESC" }[];
  limit?: number;
  offset?: number;
}

export interface IWhereCondition<T> {
  column: keyof T;
  operator: "=" | "!=" | ">" | "<" | ">=" | "<=" | "LIKE" | "IN";
  value: unknown;
}

export interface IQueryResult {
  sql: string;
  params: unknown[];
}

// ============================================
// Column Validator (Single Responsibility)
// ============================================

export class ColumnValidator {
  private static readonly VALID_COLUMN_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

  static validate(column: string): boolean {
    return this.VALID_COLUMN_REGEX.test(column);
  }

  static validateAll(columns: string[]): void {
    const invalid = columns.filter((col) => !this.validate(col));
    if (invalid.length > 0) {
      throw new Error(`Invalid column names: ${invalid.join(", ")}`);
    }
  }
}

// ============================================
// Query Builder Helper (DRY)
// ============================================

export class QueryBuilderHelper {
  static buildSelectFields<T>(columns?: (keyof T)[]): string {
    if (!columns || columns.length === 0) {
      return "*";
    }

    const columnStrings = columns.map(String);
    ColumnValidator.validateAll(columnStrings);
    return columnStrings.join(", ");
  }

  static buildWhereClause<T>(
    conditions: IWhereCondition<T>[],
    baseParams: unknown[] = []
  ): { clause: string; params: unknown[] } {
    if (conditions.length === 0) {
      return { clause: "", params: baseParams };
    }

    const clauses: string[] = [];
    const params: unknown[] = [...baseParams];

    for (const condition of conditions) {
      const colName = String(condition.column);
      ColumnValidator.validate(colName);

      if (condition.operator === "IN") {
        const values = Array.isArray(condition.value)
          ? condition.value
          : [condition.value];
        const placeholders = values.map(() => "?").join(", ");
        clauses.push(`${colName} IN (${placeholders})`);
        params.push(...values);
      } else {
        clauses.push(`${colName} ${condition.operator} ?`);
        params.push(condition.value);
      }
    }

    return {
      clause: clauses.length > 0 ? ` AND ${clauses.join(" AND ")}` : "",
      params,
    };
  }

  static buildOrderByClause<T>(
    orderBy?: { column: keyof T; direction: "ASC" | "DESC" }[]
  ): string {
    if (!orderBy || orderBy.length === 0) {
      return "";
    }

    const columns = orderBy.map((o) => String(o.column));
    ColumnValidator.validateAll(columns);

    const orderClauses = orderBy.map(
      (o) => `${String(o.column)} ${o.direction}`
    );
    return ` ORDER BY ${orderClauses.join(", ")}`;
  }

  static buildPaginationClause(limit?: number, offset?: number): string {
    const parts: string[] = [];
    if (limit !== undefined && limit > 0) {
      parts.push(`LIMIT ${limit}`);
    }
    if (offset !== undefined && offset > 0) {
      parts.push(`OFFSET ${offset}`);
    }
    return parts.length > 0 ? ` ${parts.join(" ")}` : "";
  }
}

// ============================================
// Enhanced Base Queries
// ============================================

export class BaseQueries<T extends IBaseEntities> {
  private readonly table: string;
  private readonly defaultSoftDeleteColumn = "IsDeleted";
  private readonly defaultSoftDeleteValue = 1;

  constructor(table: string) {
    if (!ColumnValidator.validate(table)) {
      throw new Error(`Invalid table name: ${table}`);
    }
    this.table = table;
  }

  // ============================================
  // READ Operations
  // ============================================

  getAll(options?: IQueryOptions<T>): IQueryResult {
    const fields = QueryBuilderHelper.buildSelectFields(options?.columns);
    const orderBy = QueryBuilderHelper.buildOrderByClause(options?.orderBy);
    const pagination = QueryBuilderHelper.buildPaginationClause(
      options?.limit,
      options?.offset
    );

    const sql = `SELECT ${fields} FROM ${this.table} WHERE ${this.defaultSoftDeleteColumn} = 0 AND OrgId = ?${orderBy}${pagination}`;

    return { sql, params: [] };
  }

  getById(id: string, orgId: string, columns?: (keyof T)[]): IQueryResult {
    const fields = QueryBuilderHelper.buildSelectFields(columns);
    const sql = `SELECT ${fields} FROM ${this.table} WHERE Uid = ? AND OrgId = ? AND ${this.defaultSoftDeleteColumn} = 0`;

    return { sql, params: [id, orgId] };
  }

  getByConditions(
    conditions: IWhereCondition<T>[],
    orgId: string,
    options?: IQueryOptions<T>
  ): IQueryResult {
    const fields = QueryBuilderHelper.buildSelectFields(options?.columns);
    const baseParams = [orgId];

    const { clause: whereClause, params } = QueryBuilderHelper.buildWhereClause(
      conditions,
      baseParams
    );

    const orderBy = QueryBuilderHelper.buildOrderByClause(options?.orderBy);
    const pagination = QueryBuilderHelper.buildPaginationClause(
      options?.limit,
      options?.offset
    );

    const sql = `SELECT ${fields} FROM ${this.table} WHERE ${this.defaultSoftDeleteColumn} = 0 AND OrgId = ?${whereClause}${orderBy}${pagination}`;

    return { sql, params };
  }

  count(conditions?: IWhereCondition<T>[], orgId?: string): IQueryResult {
    const baseParams: unknown[] = orgId ? [orgId] : [];
    const whereBase = orgId
      ? `${this.defaultSoftDeleteColumn} = 0 AND OrgId = ?`
      : `${this.defaultSoftDeleteColumn} = 0`;

    const { clause: whereClause, params } =
      conditions && conditions.length > 0
        ? QueryBuilderHelper.buildWhereClause(conditions, baseParams)
        : { clause: "", params: baseParams };

    const sql = `SELECT COUNT(*) as count FROM ${this.table} WHERE ${whereBase}${whereClause}`;

    return { sql, params };
  }

  // ============================================
  // CREATE Operations
  // ============================================

  create(entity: Partial<T>): IQueryResult {
    const entries = Object.entries(entity).filter(
      ([_, value]) => value !== undefined
    );

    if (entries.length === 0) {
      throw new Error("Cannot create entity with no defined properties");
    }

    const keys = entries.map(([key]) => key);
    ColumnValidator.validateAll(keys);

    const values = entries.map(([_, value]) => value);
    const placeholders = keys.map(() => "?").join(", ");

    const sql = `INSERT INTO ${this.table} (${keys.join(
      ", "
    )}) VALUES (${placeholders})`;

    return { sql, params: values };
  }

  bulkCreate(entities: Partial<T>[]): IQueryResult {
    if (entities.length === 0) {
      throw new Error("Cannot bulk create with empty array");
    }

    // Get all unique keys from all entities
    const allKeys = Array.from(
      new Set(
        entities.flatMap((entity) =>
          Object.keys(entity).filter((k) => entity[k as keyof T] !== undefined)
        )
      )
    );

    ColumnValidator.validateAll(allKeys);

    const params: unknown[] = [];
    const valueGroups: string[] = [];

    for (const entity of entities) {
      const rowValues = allKeys.map((key) => {
        const value = entity[key as keyof T];
        params.push(value !== undefined ? value : null);
        return "?";
      });
      valueGroups.push(`(${rowValues.join(", ")})`);
    }

    const sql = `INSERT INTO ${this.table} (${allKeys.join(
      ", "
    )}) VALUES ${valueGroups.join(", ")}`;

    return { sql, params };
  }

  // ============================================
  // UPDATE Operations
  // ============================================

  update(id: string, entity: Partial<T>): IQueryResult {
    const entries = Object.entries(entity).filter(
      ([key, value]) => key !== "Uid" && value !== undefined
    );

    if (entries.length === 0) {
      throw new Error("No fields to update");
    }

    const keys = entries.map(([key]) => key);
    ColumnValidator.validateAll(keys);

    const values = entries.map(([_, value]) => value);
    const setClause = keys.map((k) => `${k} = ?`).join(", ");

    const sql = `UPDATE ${this.table} SET ${setClause} WHERE Uid = ?`;

    return { sql, params: [...values, id] };
  }

  updateByConditions(
    updates: Partial<T>,
    conditions: IWhereCondition<T>[]
  ): IQueryResult {
    const updateEntries = Object.entries(updates).filter(
      ([key, value]) => key !== "Uid" && value !== undefined
    );

    if (updateEntries.length === 0) {
      throw new Error("No fields to update");
    }

    const updateKeys = updateEntries.map(([key]) => key);
    ColumnValidator.validateAll(updateKeys);

    const updateValues = updateEntries.map(([_, value]) => value);
    const setClause = updateKeys.map((k) => `${k} = ?`).join(", ");

    const { clause: whereClause, params: whereParams } =
      QueryBuilderHelper.buildWhereClause(conditions, updateValues);

    const sql = `UPDATE ${this.table} SET ${setClause} WHERE 1=1${whereClause}`;

    return { sql, params: whereParams };
  }

  // ============================================
  // DELETE Operations (Consistent Implementation)
  // ============================================

  softDelete(id: string, deletedOn: Date = new Date()): IQueryResult {
    const sql = `UPDATE ${this.table} SET ${this.defaultSoftDeleteColumn} = ?, DeletedOn = ? WHERE Uid = ?`;
    return { sql, params: [this.defaultSoftDeleteValue, deletedOn, id] };
  }

  softDeleteMany(ids: string[], deletedOn: Date = new Date()): IQueryResult {
    if (ids.length === 0) {
      throw new Error("Cannot soft delete with empty ID array");
    }

    const placeholders = ids.map(() => "?").join(", ");
    const sql = `UPDATE ${this.table} SET ${this.defaultSoftDeleteColumn} = ?, DeletedOn = ? WHERE Uid IN (${placeholders})`;

    return { sql, params: [this.defaultSoftDeleteValue, deletedOn, ...ids] };
  }

  hardDelete(id: string): IQueryResult {
    const sql = `DELETE FROM ${this.table} WHERE Uid = ?`;
    return { sql, params: [id] };
  }

  hardDeleteMany(ids: string[]): IQueryResult {
    if (ids.length === 0) {
      throw new Error("Cannot hard delete with empty ID array");
    }

    const placeholders = ids.map(() => "?").join(", ");
    const sql = `DELETE FROM ${this.table} WHERE Uid IN (${placeholders})`;

    return { sql, params: ids };
  }

  // ============================================
  // Utility Operations
  // ============================================

  exists(id: string, orgId: string): IQueryResult {
    const sql = `SELECT EXISTS(SELECT 1 FROM ${this.table} WHERE Uid = ? AND OrgId = ? AND ${this.defaultSoftDeleteColumn} = 0) as exists`;
    return { sql, params: [id, orgId] };
  }

  restore(id: string): IQueryResult {
    const sql = `UPDATE ${this.table} SET ${this.defaultSoftDeleteColumn} = 0, DeletedOn = NULL WHERE Uid = ?`;
    return { sql, params: [id] };
  }
}

// ============================================
// Usage Example
// ============================================

const userQueries = new BaseQueries<User>("Users");

userQueries.getByConditions([], "", { orderBy: [] });

/*
interface IUser extends IBaseEntities {
  Name: string;
  Email: string;
  Age: number;
}


// Simple get all
const { sql, params } = userQueries.getAll({ 
  columns: ['Uid', 'Name', 'Email'],
  orderBy: [{ column: 'Name', direction: 'ASC' }],
  limit: 10,
  offset: 0
});

// Get by conditions
const searchQuery = userQueries.getByConditions(
  [
    { column: 'Age', operator: '>=', value: 18 },
    { column: 'Email', operator: 'LIKE', value: '%@gmail.com' }
  ],
  'org-123',
  { 
    orderBy: [{ column: 'Name', direction: 'ASC' }],
    limit: 20 
  }
);

// Bulk create
const bulkQuery = userQueries.bulkCreate([
  { Name: 'John', Email: 'john@test.com', Age: 25 },
  { Name: 'Jane', Email: 'jane@test.com', Age: 30 }
]);

// Update by conditions
const updateQuery = userQueries.updateByConditions(
  { Age: 26 },
  [{ column: 'Email', operator: '=', value: 'john@test.com' }]
);
*/
