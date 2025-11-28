# LINQ Integration Guide for Recruitment API

This guide shows you how to use the LINQ-to-SQL library in your recruitment API project.

## Table of Contents

1. [Overview](#overview)
2. [Basic Usage](#basic-usage)
3. [Integration with Repository Pattern](#integration-with-repository-pattern)
4. [Practical Examples](#practical-examples)
5. [Advanced Usage](#advanced-usage)

---

## Overview

Your LINQ library is located at `f:/P_WORK/Recruitment/recrutment_api/src/db/linq/` and provides a type-safe, fluent API for building SQL queries using TypeScript expressions.

**Key Benefits:**

- ✅ Type-safe query building
- ✅ Compile-time checking of field names
- ✅ Automatic SQL injection protection via parameterized queries
- ✅ LINQ-style fluent API (like C# LINQ)
- ✅ Cleaner, more readable code

---

## Basic Usage

### Import the Library

```typescript
import { from } from "@/db/linq";
```

### Simple Query

```typescript
// Define your entity interface
interface User {
  Uid: string;
  Name: string;
  Email: string;
  Age: number;
  IsActive: boolean;
  OrgId: string;
}

// Build a query
const query = from<User>("users")
  .where((u) => u.IsActive === true && u.Age > 18)
  .select((u) => ({ Name: u.Name, Email: u.Email }))
  .orderBy((u) => u.Name)
  .take(10);

// Get SQL and parameters
const { sql, params } = query.toSQL();

// Execute with your database connection
const [rows] = await db.execute(sql, params);
```

**Generated SQL:**

```sql
SELECT Name, Email FROM users
WHERE (IsActive = ? AND Age > ?)
ORDER BY Name ASC
LIMIT 10
```

**Params:** `[true, 18]`

---

## Integration with Repository Pattern

You can use LINQ in your existing repositories alongside the current `BaseQueries` approach.

### Option 1: Add LINQ Helper Methods to BaseRepository

Create a new file: `src/repository/base/linq.repository.ts`

```typescript
import { DatabaseConnection } from "@/db/connection/connection";
import { BaseEntities } from "@/data/entities/base-entities";
import { from, Queryable } from "@/db/linq";
import { inject, injectable } from "inversify";
import { TYPES } from "@/core/container/types";

/**
 * Extended repository with LINQ support
 */
@injectable()
export class LinqRepository<T extends BaseEntities> {
  protected readonly _db: DatabaseConnection;
  protected readonly tableName: string;

  constructor(
    @inject(TYPES.DatabaseConnection) db: DatabaseConnection,
    tableName: string
  ) {
    this._db = db;
    this.tableName = tableName;
  }

  /**
   * Create a LINQ queryable for this repository's table
   */
  protected query(): Queryable<T> {
    return from<T>(this.tableName);
  }

  /**
   * Execute a LINQ query and return results
   */
  protected async execute<TResult = T>(
    queryable: Queryable<TResult>
  ): Promise<TResult[]> {
    const { sql, params } = queryable.toSQL();
    const [rows] = await this._db.execute(sql, params);
    return rows as TResult[];
  }

  /**
   * Execute a LINQ query and return a single result
   */
  protected async executeFirst<TResult = T>(
    queryable: Queryable<TResult>
  ): Promise<TResult | null> {
    const results = await this.execute(queryable.take(1));
    return results[0] || null;
  }
}
```

### Option 2: Extend Existing Repository

Modify `src/repository/base/base.repository.ts` to include LINQ support:

```typescript
import { from, Queryable } from "@/db/linq";

export class BaseRepository<T extends BaseEntities> extends BaseQueries<T> {
  // ... existing code ...

  /**
   * Create a LINQ queryable for this table
   */
  protected linq(): Queryable<T> {
    return from<T>(this.tableName);
  }

  /**
   * Execute a LINQ query
   */
  protected async executeLinq<TResult = T>(
    queryable: Queryable<TResult>
  ): Promise<TResult[]> {
    const { sql, params } = queryable.toSQL();
    const [rows] = await this._db.execute(sql, params);
    return rows as TResult[];
  }

  /**
   * Execute a LINQ query and get first result
   */
  protected async executeLinqFirst<TResult = T>(
    queryable: Queryable<TResult>
  ): Promise<TResult | null> {
    const results = await this.executeLinq(queryable.take(1));
    return results[0] || null;
  }
}
```

---

## Practical Examples

### Example 1: Get Active Users by Organization

**Traditional Approach:**

```typescript
async getActiveUsers(orgId: string): Promise<User[]> {
    const sql = `
        SELECT * FROM users
        WHERE OrgId = ? AND IsActive = ? AND IsDeleted = ?
        ORDER BY Name ASC
    `;
    const [rows] = await this._db.execute(sql, [orgId, true, false]);
    return rows as User[];
}
```

**LINQ Approach:**

```typescript
async getActiveUsers(orgId: string): Promise<User[]> {
    return await this.executeLinq(
        this.linq()
            .where(u => u.OrgId === orgId && u.IsActive === true && u.IsDeleted === false)
            .orderBy(u => u.Name)
    );
}
```

### Example 2: Search with Dynamic Filters

```typescript
interface UserSearchFilters {
    orgId: string;
    searchTerm?: string;
    minAge?: number;
    isActive?: boolean;
    limit?: number;
    page?: number;
}

async searchUsers(filters: UserSearchFilters): Promise<User[]> {
    let query = this.linq();

    // Always filter by organization
    query = query.where(u => u.OrgId === filters.orgId && u.IsDeleted === false);

    // Apply optional filters conditionally
    if (filters.isActive !== undefined) {
        const isActive = filters.isActive;
        query = query.where(u => u.IsActive === isActive);
    }

    if (filters.minAge !== undefined) {
        const minAge = filters.minAge;
        query = query.where(u => u.Age >= minAge);
    }

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    query = query
        .orderBy(u => u.Name)
        .skip((page - 1) * limit)
        .take(limit);

    return await this.executeLinq(query);
}
```

### Example 3: Complex Query with Joins

```typescript
interface UserWithDepartment {
    UserName: string;
    UserEmail: string;
    DepartmentName: string;
}

async getUsersWithDepartments(orgId: string): Promise<UserWithDepartment[]> {
    const query = from<User>("users")
        .join("departments", "users.DepartmentId = departments.Uid")
        .where(u => u.OrgId === orgId && u.IsActive === true)
        .select(u => ({
            UserName: u.Name,
            UserEmail: u.Email
        }))
        .orderBy(u => u.Name);

    return await this.executeLinq(query);
}
```

### Example 4: Pagination with Total Count

```typescript
async getPaginatedUsers(
    orgId: string,
    page: number = 1,
    pageSize: number = 20
) {
    // Get paginated results
    const users = await this.executeLinq(
        this.linq()
            .where(u => u.OrgId === orgId && u.IsDeleted === false)
            .orderBy(u => u.CreatedOn)
            .skip((page - 1) * pageSize)
            .take(pageSize)
    );

    // Get total count (you still need a separate count query)
    const countSql = `SELECT COUNT(*) as total FROM users WHERE OrgId = ? AND IsDeleted = ?`;
    const [countResult] = await this._db.execute(countSql, [orgId, false]);
    const total = (countResult as any)[0].total;

    return {
        items: users,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        totalRecords: total
    };
}
```

### Example 5: Using in Service Layer

```typescript
// In your service (e.g., user.service.ts)
import { from } from "@/db/linq";

export class UserService extends VmService<
  UserVm,
  User,
  UserFilter,
  UserResult
> {
  async getActiveUsersByDepartment(departmentId: string): Promise<User[]> {
    const query = from<User>(this._repository["tableName"])
      .where(
        (u) =>
          u.DepartmentId === departmentId &&
          u.IsActive === true &&
          u.IsDeleted === false &&
          u.OrgId === this._callerService.tenantId
      )
      .orderBy((u) => u.Name);

    const { sql, params } = query.toSQL();
    const [rows] = await this._repository["_db"].execute(sql, params);
    return rows as User[];
  }

  async searchUsersByName(namePattern: string): Promise<User[]> {
    // For string patterns, you'll still need raw SQL for LIKE
    // LINQ doesn't support LIKE yet
    const sql = `
            SELECT * FROM users 
            WHERE Name LIKE ? 
            AND OrgId = ? 
            AND IsActive = ? 
            AND IsDeleted = ?
            ORDER BY Name
        `;
    const [rows] = await this._repository["_db"].execute(sql, [
      `%${namePattern}%`,
      this._callerService.tenantId,
      true,
      false,
    ]);
    return rows as User[];
  }
}
```

---

## Advanced Usage

### Custom Repository with LINQ

Create specialized repositories that use LINQ:

```typescript
// src/repository/implementation/user-linq.repository.ts
import { injectable } from "inversify";
import { BaseRepository } from "../base/base.repository";
import { User } from "@/data/entities/user.entity";

@injectable()
export class UserLinqRepository extends BaseRepository<User> {
  constructor(@inject(TYPES.DatabaseConnection) db: DatabaseConnection) {
    super(db, "users");
  }

  async findActiveByEmail(email: string, orgId: string): Promise<User | null> {
    return await this.executeLinqFirst(
      this.linq().where(
        (u) =>
          u.Email === email &&
          u.OrgId === orgId &&
          u.IsActive === true &&
          u.IsDeleted === false
      )
    );
  }

  async findByAgeRange(
    minAge: number,
    maxAge: number,
    orgId: string
  ): Promise<User[]> {
    return await this.executeLinq(
      this.linq()
        .where(
          (u) =>
            u.Age >= minAge &&
            u.Age <= maxAge &&
            u.OrgId === orgId &&
            u.IsDeleted === false
        )
        .orderBy((u) => u.Age)
    );
  }

  async getRecentUsers(orgId: string, days: number = 7): Promise<User[]> {
    return await this.executeLinq(
      this.linq()
        .where((u) => u.OrgId === orgId && u.IsDeleted === false)
        .orderByDescending((u) => u.CreatedOn)
        .take(days)
    );
  }
}
```

### Type-Safe Query Builder Function

```typescript
function buildUserQuery(filters: {
  orgId: string;
  isActive?: boolean;
  departmentId?: string;
  minAge?: number;
  sortBy?: keyof User;
  sortDesc?: boolean;
  limit?: number;
}) {
  let query = from<User>("users").where(
    (u) => u.OrgId === filters.orgId && u.IsDeleted === false
  );

  if (filters.isActive !== undefined) {
    const isActive = filters.isActive;
    query = query.where((u) => u.IsActive === isActive);
  }

  if (filters.departmentId) {
    const deptId = filters.departmentId;
    query = query.where((u) => u.DepartmentId === deptId);
  }

  if (filters.minAge !== undefined) {
    const minAge = filters.minAge;
    query = query.where((u) => u.Age >= minAge);
  }

  // Sorting (Note: dynamic sorting requires accessing by index)
  if (filters.sortBy) {
    if (filters.sortDesc) {
      query = query.orderByDescending((u) => u[filters.sortBy!]);
    } else {
      query = query.orderBy((u) => u[filters.sortBy!]);
    }
  }

  if (filters.limit) {
    query = query.take(filters.limit);
  }

  return query;
}
```

---

## When to Use LINQ vs Traditional Queries

### Use LINQ when:

✅ You need type-safe queries  
✅ Your query logic is dynamic (conditional filters)  
✅ You want better code readability  
✅ You're working with simple to moderately complex queries  
✅ You need parameterized queries to prevent SQL injection

### Use Traditional SQL when:

❌ You need advanced SQL features (LIKE, subqueries, CTEs, window functions)  
❌ You're working with complex joins or aggregations  
❌ Performance optimization requires specific SQL syntax  
❌ You need database-specific features

---

## Quick Reference

### Common Query Patterns

```typescript
// Filter
.where(u => u.IsActive === true)

// Multiple conditions (AND)
.where(u => u.IsActive === true && u.Age > 18)

// OR conditions
.where(u => u.Age < 18 || u.Age > 65)

// Select specific fields
.select(u => ({ Name: u.Name, Email: u.Email }))

// Order by ascending
.orderBy(u => u.Name)

// Order by descending
.orderByDescending(u => u.CreatedOn)

// Pagination
.skip((page - 1) * pageSize).take(pageSize)

// Joins
.join("departments", "users.DeptId = departments.Uid")
.leftJoin("profiles", "users.Uid = profiles.UserId")

// Group by
.groupBy(u => u.Country)

// Having (after group by)
.having(g => g.count > 10)
```

---

## Next Steps

1. Add LINQ helper methods to `BaseRepository` (Option 2 above)
2. Start using LINQ in your service methods for type-safe queries
3. Gradually refactor existing queries to use LINQ where appropriate
4. Extend the LINQ library as needed for your specific use cases

## See Also

- [examples.ts](file:///f:/P_WORK/Recruitment/recrutment_api/src/db/linq/examples.ts) - Comprehensive usage examples
- [index.ts](file:///f:/P_WORK/Recruitment/recrutment_api/src/db/linq/index.ts) - LINQ library source code
