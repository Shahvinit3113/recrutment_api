import { BaseEntities } from "@/data/entities/base-entities";

// ============================================
// Types & Interfaces for Query Builder
// ============================================

/**
 * Supported SQL operators
 */
export type SQLOperator =
  | "=" | "!=" | "<>" | ">" | "<" | ">=" | "<="
  | "LIKE" | "NOT LIKE" | "IN" | "NOT IN"
  | "BETWEEN" | "IS NULL" | "IS NOT NULL";

/**
 * Logical operators for combining conditions
 */
export type LogicalOperator = "AND" | "OR";

/**
 * Join types
 */
export type JoinType = "INNER JOIN" | "LEFT JOIN" | "RIGHT JOIN" | "FULL OUTER JOIN";

/**
 * Aggregate functions
 */
export type AggregateFunction = "COUNT" | "SUM" | "AVG" | "MIN" | "MAX";

/**
 * Where condition with logical operator support
 */
export interface WhereCondition<T = any> {
  column: keyof T | string;
  operator: SQLOperator;
  value?: any;
  logic?: LogicalOperator;
}

/**
 * Join configuration
 */
export interface JoinConfig<T = any> {
  type: JoinType;
  table: string;
  alias?: string;
  on: {
    left: string;  // left.column
    right: string; // right.column
    operator?: "=" | "!=" | ">" | "<" | ">=" | "<=";
  };
}

/**
 * Group by configuration
 */
export interface GroupByConfig<T = any> {
  columns: (keyof T | string)[];
  having?: WhereCondition<T>[];
}

/**
 * Order by configuration
 */
export interface OrderByConfig<T = any> {
  column: keyof T | string;
  direction: "ASC" | "DESC";
}

/**
 * Pagination configuration
 */
export interface PaginationConfig {
  limit?: number;
  offset?: number;
}

/**
 * SELECT query configuration
 */
export interface SelectQueryConfig<T = any> {
  columns?: (keyof T | string | { column: string; alias: string; aggregate?: AggregateFunction })[];
  distinct?: boolean;
  where?: WhereCondition<T>[];
  joins?: JoinConfig<T>[];
  groupBy?: GroupByConfig<T>;
  orderBy?: OrderByConfig<T>[];
  pagination?: PaginationConfig;
}

/**
 * INSERT query configuration
 */
export interface InsertQueryConfig<T = any> {
  data: Partial<T> | Partial<T>[];
  onDuplicateUpdate?: (keyof T)[];
}

/**
 * UPDATE query configuration
 */
export interface UpdateQueryConfig<T = any> {
  data: Partial<T>;
  where?: WhereCondition<T>[];
}

/**
 * DELETE query configuration
 */
export interface DeleteQueryConfig<T = any> {
  where?: WhereCondition<T>[];
  soft?: boolean;
  softDeleteColumn?: string;
}

/**
 * Query result containing SQL and parameters
 */
export interface QueryResult {
  sql: string;
  params: any[];
}

// ============================================
// Advanced SQL Query Builder
// ============================================

/**
 * Comprehensive SQL Query Builder with object-based API
 * Supports SELECT, INSERT, UPDATE, DELETE, JOINs, GROUP BY, HAVING, UNION, etc.
 * 
 * @example
 * ```typescript
 * const qb = new QueryBuilder<User>("users");
 * 
 * // Simple SELECT
 * const result = qb.select({
 *   columns: ["id", "name", "email"],
 *   where: [{ column: "isActive", operator: "=", value: true }],
 *   orderBy: [{ column: "name", direction: "ASC" }]
 * });
 * ```
 */
export class QueryBuilder<T extends Record<string, any> = any> {
  private tableName: string;
  private tableAlias?: string;

  constructor(table: string, alias?: string) {
    this.tableName = table;
    this.tableAlias = alias;
  }

  /**
   * Build SELECT query with advanced options
   */
  select(config: SelectQueryConfig<T>): QueryResult {
    const params: any[] = [];
    let sql = "SELECT ";

    // DISTINCT
    if (config.distinct) {
      sql += "DISTINCT ";
    }

    // COLUMNS
    if (!config.columns || config.columns.length === 0) {
      sql += "*";
    } else {
      const cols = config.columns.map((col) => {
        if (typeof col === "string") {
          return col;
        } else if (typeof col === "object" && "column" in col) {
          let colStr = col.aggregate
            ? `${col.aggregate}(${col.column})`
            : col.column;
          if (col.alias) {
            colStr += ` AS ${col.alias}`;
          }
          return colStr;
        }
        return String(col);
      });
      sql += cols.join(", ");
    }

    // FROM
    sql += ` FROM ${this.tableName}`;
    if (this.tableAlias) {
      sql += ` AS ${this.tableAlias}`;
    }

    // JOINS
    if (config.joins && config.joins.length > 0) {
      for (const join of config.joins) {
        const joinAlias = join.alias ? ` AS ${join.alias}` : "";
        const operator = join.on.operator || "=";
        sql += ` ${join.type} ${join.table}${joinAlias} ON ${join.on.left} ${operator} ${join.on.right}`;
      }
    }

    // WHERE
    if (config.where && config.where.length > 0) {
      const whereClause = this.buildWhereClause(config.where, params);
      sql += ` WHERE ${whereClause}`;
    }

    // GROUP BY
    if (config.groupBy) {
      sql += ` GROUP BY ${config.groupBy.columns.join(", ")}`;

      // HAVING
      if (config.groupBy.having && config.groupBy.having.length > 0) {
        const havingClause = this.buildWhereClause(config.groupBy.having, params);
        sql += ` HAVING ${havingClause}`;
      }
    }

    // ORDER BY
    if (config.orderBy && config.orderBy.length > 0) {
      const orderClauses = config.orderBy.map(
        (o) => `${String(o.column)} ${o.direction}`
      );
      sql += ` ORDER BY ${orderClauses.join(", ")}`;
    }

    // PAGINATION
    if (config.pagination) {
      if (config.pagination.limit) {
        sql += ` LIMIT ${config.pagination.limit}`;
      }
      if (config.pagination.offset) {
        sql += ` OFFSET ${config.pagination.offset}`;
      }
    }

    return { sql, params };
  }

  /**
   * Build INSERT query (single or bulk)
   */
  insert(config: InsertQueryConfig<T>): QueryResult {
    const params: any[] = [];
    const dataArray = Array.isArray(config.data) ? config.data : [config.data];

    if (dataArray.length === 0) {
      throw new Error("Cannot insert with empty data");
    }

    // Get all unique columns
    const allColumns = Array.from(
      new Set(
        dataArray.flatMap((item) =>
          Object.keys(item).filter((k) => item[k as keyof T] !== undefined)
        )
      )
    );

    let sql = `INSERT INTO ${this.tableName} (${allColumns.join(", ")}) VALUES `;

    // Build value placeholders
    const valueGroups = dataArray.map((item) => {
      const values = allColumns.map((col) => {
        const value = item[col as keyof T];
        params.push(value !== undefined ? value : null);
        return "?";
      });
      return `(${values.join(", ")})`;
    });

    sql += valueGroups.join(", ");

    // ON DUPLICATE KEY UPDATE
    if (config.onDuplicateUpdate && config.onDuplicateUpdate.length > 0) {
      const updateClauses = config.onDuplicateUpdate.map(
        (col) => `${String(col)} = VALUES(${String(col)})`
      );
      sql += ` ON DUPLICATE KEY UPDATE ${updateClauses.join(", ")}`;
    }

    return { sql, params };
  }

  /**
   * Build UPDATE query
   */
  update(config: UpdateQueryConfig<T>): QueryResult {
    const params: any[] = [];

    const entries = Object.entries(config.data).filter(
      ([_, value]) => value !== undefined
    );

    if (entries.length === 0) {
      throw new Error("No fields to update");
    }

    const setClauses = entries.map(([key, value]) => {
      params.push(value);
      return `${key} = ?`;
    });

    let sql = `UPDATE ${this.tableName} SET ${setClauses.join(", ")}`;

    // WHERE
    if (config.where && config.where.length > 0) {
      const whereClause = this.buildWhereClause(config.where, params);
      sql += ` WHERE ${whereClause}`;
    }

    return { sql, params };
  }

  /**
   * Build DELETE query
   */
  delete(config: DeleteQueryConfig<T> = {}): QueryResult {
    const params: any[] = [];
    let sql: string;

    if (config.soft) {
      // Soft delete - UPDATE instead of DELETE
      const softCol = config.softDeleteColumn || "IsDeleted";
      sql = `UPDATE ${this.tableName} SET ${softCol} = 1, DeletedOn = NOW()`;
    } else {
      // Hard delete
      sql = `DELETE FROM ${this.tableName}`;
    }

    // WHERE
    if (config.where && config.where.length > 0) {
      const whereClause = this.buildWhereClause(config.where, params);
      sql += ` WHERE ${whereClause}`;
    } else if (!config.soft) {
      throw new Error("DELETE without WHERE clause is not allowed for safety");
    }

    return { sql, params };
  }

  /**
   * Build COUNT query
   */
  count(where?: WhereCondition<T>[], distinct?: string): QueryResult {
    const params: any[] = [];
    const countExpr = distinct ? `DISTINCT ${distinct}` : "*";
    let sql = `SELECT COUNT(${countExpr}) AS count FROM ${this.tableName}`;

    if (where && where.length > 0) {
      const whereClause = this.buildWhereClause(where, params);
      sql += ` WHERE ${whereClause}`;
    }

    return { sql, params };
  }

  /**
   * Build EXISTS query
   */
  exists(where: WhereCondition<T>[]): QueryResult {
    const params: any[] = [];
    let sql = `SELECT EXISTS(SELECT 1 FROM ${this.tableName}`;

    if (where && where.length > 0) {
      const whereClause = this.buildWhereClause(where, params);
      sql += ` WHERE ${whereClause}`;
    }

    sql += ") AS `exists`";
    return { sql, params };
  }

  /**
   * Build UNION query
   */
  union(queries: QueryResult[], unionAll: boolean = false): QueryResult {
    if (queries.length < 2) {
      throw new Error("UNION requires at least 2 queries");
    }

    const sqlParts = queries.map((q) => q.sql);
    const allParams = queries.flatMap((q) => q.params);
    const unionType = unionAll ? " UNION ALL " : " UNION ";

    return {
      sql: sqlParts.join(unionType),
      params: allParams,
    };
  }

  /**
   * Build raw query with parameters
   */
  raw(sql: string, params: any[] = []): QueryResult {
    return { sql, params };
  }

  /**
   * Helper: Build WHERE clause from conditions
   */
  private buildWhereClause(conditions: WhereCondition<T>[], params: any[]): string {
    if (conditions.length === 0) {
      return "1=1";
    }

    const clauses: string[] = [];

    for (let i = 0; i < conditions.length; i++) {
      const condition = conditions[i];
      const logic = i === 0 ? "" : ` ${condition.logic || "AND"} `;
      const column = String(condition.column);

      let clause = "";

      switch (condition.operator) {
        case "IS NULL":
          clause = `${logic}${column} IS NULL`;
          break;

        case "IS NOT NULL":
          clause = `${logic}${column} IS NOT NULL`;
          break;

        case "IN":
        case "NOT IN":
          const values = Array.isArray(condition.value)
            ? condition.value
            : [condition.value];
          const placeholders = values.map(() => "?").join(", ");
          clause = `${logic}${column} ${condition.operator} (${placeholders})`;
          params.push(...values);
          break;

        case "BETWEEN":
          if (!Array.isArray(condition.value) || condition.value.length !== 2) {
            throw new Error("BETWEEN requires array of 2 values");
          }
          clause = `${logic}${column} BETWEEN ? AND ?`;
          params.push(condition.value[0], condition.value[1]);
          break;

        default:
          clause = `${logic}${column} ${condition.operator} ?`;
          params.push(condition.value);
      }

      clauses.push(clause);
    }

    return clauses.join("");
  }
}

// ============================================
// USAGE EXAMPLES (Comprehensive)
// ============================================

/*

// ============================================
// 1. BASIC SELECT QUERIES
// ============================================

const userQB = new QueryBuilder<User>("users");

// Simple select all
const q1 = userQB.select({});
// SQL: SELECT * FROM users
// Params: []

// Select specific columns
const q2 = userQB.select({
  columns: ["id", "name", "email"]
});
// SQL: SELECT id, name, email FROM users
// Params: []

// Select with WHERE
const q3 = userQB.select({
  columns: ["id", "name"],
  where: [
    { column: "isActive", operator: "=", value: true },
    { column: "age", operator: ">=", value: 18, logic: "AND" }
  ]
});
// SQL: SELECT id, name FROM users WHERE isActive = ? AND age >= ?
// Params: [true, 18]

// Select with ORDER BY and LIMIT
const q4 = userQB.select({
  where: [{ column: "isDeleted", operator: "=", value: false }],
  orderBy: [
    { column: "createdAt", direction: "DESC" },
    { column: "name", direction: "ASC" }
  ],
  pagination: { limit: 10, offset: 0 }
});
// SQL: SELECT * FROM users WHERE isDeleted = ? ORDER BY createdAt DESC, name ASC LIMIT 10 OFFSET 0
// Params: [false]

// Select DISTINCT
const q5 = userQB.select({
  columns: ["country"],
  distinct: true
});
// SQL: SELECT DISTINCT country FROM users
// Params: []

// ============================================
// 2. ADVANCED WHERE CONDITIONS
// ============================================

// IN operator
const q6 = userQB.select({
  where: [
    { column: "id", operator: "IN", value: [1, 2, 3, 4, 5] }
  ]
});
// SQL: SELECT * FROM users WHERE id IN (?, ?, ?, ?, ?)
// Params: [1, 2, 3, 4, 5]

// LIKE operator
const q7 = userQB.select({
  where: [
    { column: "email", operator: "LIKE", value: "%@gmail.com" }
  ]
});
// SQL: SELECT * FROM users WHERE email LIKE ?
// Params: ["%@gmail.com"]

// BETWEEN operator
const q8 = userQB.select({
  where: [
    { column: "age", operator: "BETWEEN", value: [18, 65] }
  ]
});
// SQL: SELECT * FROM users WHERE age BETWEEN ? AND ?
// Params: [18, 65]

// IS NULL / IS NOT NULL
const q9 = userQB.select({
  where: [
    { column: "deletedAt", operator: "IS NULL" }
  ]
});
// SQL: SELECT * FROM users WHERE deletedAt IS NULL
// Params: []

// Complex WHERE with OR logic
const q10 = userQB.select({
  where: [
    { column: "role", operator: "=", value: "admin" },
    { column: "role", operator: "=", value: "moderator", logic: "OR" },
    { column: "isActive", operator: "=", value: true, logic: "AND" }
  ]
});
// SQL: SELECT * FROM users WHERE role = ? OR role = ? AND isActive = ?
// Params: ["admin", "moderator", true]

// ============================================
// 3. JOIN QUERIES
// ============================================

// INNER JOIN
const q11 = userQB.select({
  columns: [
    "users.id",
    "users.name",
    "profiles.bio",
    "profiles.avatar"
  ],
  joins: [
    {
      type: "INNER JOIN",
      table: "profiles",
      on: { left: "users.id", right: "profiles.userId" }
    }
  ]
});
// SQL: SELECT users.id, users.name, profiles.bio, profiles.avatar 
//      FROM users INNER JOIN profiles ON users.id = profiles.userId
// Params: []

// LEFT JOIN with WHERE
const q12 = userQB.select({
  columns: [
    "users.id",
    "users.name",
    "orders.totalAmount"
  ],
  joins: [
    {
      type: "LEFT JOIN",
      table: "orders",
      alias: "o",
      on: { left: "users.id", right: "o.userId" }
    }
  ],
  where: [
    { column: "users.isActive", operator: "=", value: true }
  ]
});
// SQL: SELECT users.id, users.name, orders.totalAmount 
//      FROM users LEFT JOIN orders AS o ON users.id = o.userId 
//      WHERE users.isActive = ?
// Params: [true]

// Multiple JOINs
const q13 = userQB.select({
  columns: ["u.id", "u.name", "p.bio", "o.total"],
  joins: [
    {
      type: "LEFT JOIN",
      table: "profiles",
      alias: "p",
      on: { left: "u.id", right: "p.userId" }
    },
    {
      type: "LEFT JOIN",
      table: "orders",
      alias: "o",
      on: { left: "u.id", right: "o.userId" }
    }
  ]
});

// ============================================
// 4. AGGREGATION QUERIES
// ============================================

// COUNT with column alias
const q14 = userQB.select({
  columns: [
    { column: "*", alias: "total", aggregate: "COUNT" }
  ],
  where: [
    { column: "isActive", operator: "=", value: true }
  ]
});
// SQL: SELECT COUNT(*) AS total FROM users WHERE isActive = ?
// Params: [true]

// Multiple aggregates
const q15 = new QueryBuilder("orders").select({
  columns: [
    { column: "userId", alias: "userId" },
    { column: "*", alias: "orderCount", aggregate: "COUNT" },
    { column: "totalAmount", alias: "totalSpent", aggregate: "SUM" },
    { column: "totalAmount", alias: "avgOrder", aggregate: "AVG" }
  ],
  groupBy: {
    columns: ["userId"]
  }
});
// SQL: SELECT userId, COUNT(*) AS orderCount, SUM(totalAmount) AS totalSpent, 
//      AVG(totalAmount) AS avgOrder FROM orders GROUP BY userId
// Params: []

// GROUP BY with HAVING
const q16 = new QueryBuilder("orders").select({
  columns: [
    { column: "userId", alias: "userId" },
    { column: "*", alias: "orderCount", aggregate: "COUNT" }
  ],
  groupBy: {
    columns: ["userId"],
    having: [
      { column: "COUNT(*)", operator: ">", value: 5 }
    ]
  }
});
// SQL: SELECT userId, COUNT(*) AS orderCount FROM orders 
//      GROUP BY userId HAVING COUNT(*) > ?
// Params: [5]

// ============================================
// 5. INSERT QUERIES
// ============================================

// Single insert
const q17 = userQB.insert({
  data: {
    name: "John Doe",
    email: "john@example.com",
    age: 30,
    isActive: true
  }
});
// SQL: INSERT INTO users (name, email, age, isActive) VALUES (?, ?, ?, ?)
// Params: ["John Doe", "john@example.com", 30, true]

// Bulk insert
const q18 = userQB.insert({
  data: [
    { name: "John", email: "john@test.com", age: 25 },
    { name: "Jane", email: "jane@test.com", age: 28 },
    { name: "Bob", email: "bob@test.com", age: 32 }
  ]
});
// SQL: INSERT INTO users (name, email, age) VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?)
// Params: ["John", "john@test.com", 25, "Jane", "jane@test.com", 28, "Bob", "bob@test.com", 32]

// Insert with ON DUPLICATE KEY UPDATE
const q19 = userQB.insert({
  data: {
    id: 1,
    name: "John Updated",
    email: "john@example.com"
  },
  onDuplicateUpdate: ["name"]
});
// SQL: INSERT INTO users (id, name, email) VALUES (?, ?, ?) 
//      ON DUPLICATE KEY UPDATE name = VALUES(name)
// Params: [1, "John Updated", "john@example.com"]

// ============================================
// 6. UPDATE QUERIES
// ============================================

// Simple update
const q20 = userQB.update({
  data: {
    name: "John Smith",
    updatedAt: new Date()
  },
  where: [
    { column: "id", operator: "=", value: 1 }
  ]
});
// SQL: UPDATE users SET name = ?, updatedAt = ? WHERE id = ?
// Params: ["John Smith", new Date(), 1]

// Update multiple records
const q21 = userQB.update({
  data: {
    isActive: false
  },
  where: [
    { column: "lastLoginAt", operator: "<", value: "2023-01-01" }
  ]
});
// SQL: UPDATE users SET isActive = ? WHERE lastLoginAt < ?
// Params: [false, "2023-01-01"]

// Update with complex WHERE
const q22 = userQB.update({
  data: {
    tier: "premium"
  },
  where: [
    { column: "totalSpent", operator: ">=", value: 1000 },
    { column: "isActive", operator: "=", value: true, logic: "AND" }
  ]
});
// SQL: UPDATE users SET tier = ? WHERE totalSpent >= ? AND isActive = ?
// Params: ["premium", 1000, true]

// ============================================
// 7. DELETE QUERIES
// ============================================

// Hard delete with WHERE
const q23 = userQB.delete({
  where: [
    { column: "id", operator: "=", value: 1 }
  ]
});
// SQL: DELETE FROM users WHERE id = ?
// Params: [1]

// Soft delete
const q24 = userQB.delete({
  soft: true,
  where: [
    { column: "id", operator: "=", value: 1 }
  ]
});
// SQL: UPDATE users SET IsDeleted = 1, DeletedOn = NOW() WHERE id = ?
// Params: [1]

// Soft delete with custom column
const q25 = userQB.delete({
  soft: true,
  softDeleteColumn: "deleted",
  where: [
    { column: "email", operator: "LIKE", value: "%spam%" }
  ]
});
// SQL: UPDATE users SET deleted = 1, DeletedOn = NOW() WHERE email LIKE ?
// Params: ["%spam%"]

// ============================================
// 8. UTILITY QUERIES
// ============================================

// COUNT query
const q26 = userQB.count([
  { column: "isActive", operator: "=", value: true }
]);
// SQL: SELECT COUNT(*) AS count FROM users WHERE isActive = ?
// Params: [true]

// COUNT DISTINCT
const q27 = userQB.count(
  [{ column: "country", operator: "IS NOT NULL" }],
  "country"
);
// SQL: SELECT COUNT(DISTINCT country) AS count FROM users WHERE country IS NOT NULL
// Params: []

// EXISTS query
const q28 = userQB.exists([
  { column: "email", operator: "=", value: "john@test.com" }
]);
// SQL: SELECT EXISTS(SELECT 1 FROM users WHERE email = ?) AS `exists`
// Params: ["john@test.com"]

// ============================================
// 9. UNION QUERIES
// ============================================

const activeUsers = userQB.select({
  columns: ["id", "name"],
  where: [{ column: "isActive", operator: "=", value: true }]
});

const inactiveUsers = userQB.select({
  columns: ["id", "name"],
  where: [{ column: "isActive", operator: "=", value: false }]
});

const q29 = userQB.union([activeUsers, inactiveUsers]);
// SQL: SELECT id, name FROM users WHERE isActive = ? 
//      UNION 
//      SELECT id, name FROM users WHERE isActive = ?
// Params: [true, false]

const q30 = userQB.union([activeUsers, inactiveUsers], true);
// SQL: ... UNION ALL ...

// ============================================
// 10. RAW QUERIES
// ============================================

const q31 = userQB.raw(
  "SELECT * FROM users WHERE YEAR(createdAt) = ?",
  [2024]
);
// SQL: SELECT * FROM users WHERE YEAR(createdAt) = ?
// Params: [2024]

// ============================================
// 11. COMPLEX REAL-WORLD EXAMPLES
// ============================================

// E-commerce: Get top customers by spending
const q32 = new QueryBuilder("orders").select({
  columns: [
    "userId",
    { column: "*", alias: "orderCount", aggregate: "COUNT" },
    { column: "totalAmount", alias: "totalSpent", aggregate: "SUM" }
  ],
  where: [
    { column: "status", operator: "=", value: "completed" },
    { column: "createdAt", operator: ">=", value: "2024-01-01", logic: "AND" }
  ],
  groupBy: {
    columns: ["userId"],
    having: [
      { column: "SUM(totalAmount)", operator: ">", value: 1000 }
    ]
  },
  orderBy: [
    { column: "totalSpent", direction: "DESC" }
  ],
  pagination: { limit: 10 }
});
// Get top 10 customers who spent > $1000 in 2024

// Analytics: User engagement report
const q33 = new QueryBuilder("users", "u").select({
  columns: [
    "u.id",
    "u.name",
    "u.email",
    { column: "p.bio", alias: "bio" },
    { column: "o.id", alias: "orderCount", aggregate: "COUNT" }
  ],
  joins: [
    {
      type: "LEFT JOIN",
      table: "profiles",
      alias: "p",
      on: { left: "u.id", right: "p.userId" }
    },
    {
      type: "LEFT JOIN",
      table: "orders",
      alias: "o",
      on: { left: "u.id", right: "o.userId" }
    }
  ],
  where: [
    { column: "u.isActive", operator: "=", value: true },
    { column: "u.createdAt", operator: ">=", value: "2023-01-01", logic: "AND" }
  ],
  groupBy: {
    columns: ["u.id", "u.name", "u.email", "p.bio"]
  },
  orderBy: [
    { column: "orderCount", direction: "DESC" }
  ]
});
// Complex report with JOINs and aggregations

*/
