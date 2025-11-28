import { inject, injectable } from "inversify";
import { TYPES } from "@/core/container/types";
import { DatabaseConnection } from "@/db/connection/connection";
import { from, Queryable } from "@/db/linq";
import { User } from "@/data/entities/user";
import { CallerService } from "@/service/caller/caller.service";

/**
 * Database Context providing LINQ access to all entities
 * Similar to Entity Framework's DbContext in .NET
 * 
 * @example
 * ```typescript
 * // In your service
 * const users = await this._dbContext.Users
 *   .where(u => u.IsActive && !u.IsDeleted)
 *   .orderBy(u => u.CreatedOn)
 *   .execute();
 * ```
 */
@injectable()
export class DbContext {
    constructor(
        @inject(TYPES.DatabaseConnection) private readonly _db: DatabaseConnection,
        @inject(TYPES.Caller) private readonly _caller: CallerService
    ) { }

    /**
     * Gets queryable for Users table
     */
    get Users(): DbSet<User> {
        return new DbSet<User>(this._db, this._caller, "users");
    }

    // Add more entities as needed
    // get Departments(): DbSet<Department> { ... }
    // get Positions(): DbSet<Position> { ... }
}

/**
 * DbSet represents a queryable collection of entities
 * Wraps LINQ queryable with automatic execution
 */
export class DbSet<T> {
    private _queryable: Queryable<T>;

    constructor(
        private readonly _db: DatabaseConnection,
        private readonly _caller: CallerService,
        private readonly tableName: string
    ) {
        this._queryable = from<T>(tableName);
    }

    /**
     * Filters entities based on predicate
     */
    where(predicate: (entity: T) => boolean): DbSet<T> {
        const newSet = this.clone();
        newSet._queryable = this._queryable.where(predicate);
        return newSet;
    }

    /**
     * Performs an INNER JOIN with another table
     * @example
     * _dbContext.Users
     *   .join("departments", "users.DeptId = departments.Uid")
     *   .where(u => u.OrgId === orgId)
     */
    join(tableName: string, condition: string): DbSet<T> {
        const newSet = this.clone();
        newSet._queryable = this._queryable.join(tableName, condition);
        return newSet;
    }

    /**
     * Performs a LEFT JOIN with another table
     */
    leftJoin(tableName: string, condition: string): DbSet<T> {
        const newSet = this.clone();
        newSet._queryable = this._queryable.leftJoin(tableName, condition);
        return newSet;
    }

    /**
     * Performs an INNER JOIN (alias for join)
     */
    innerJoin(tableName: string, condition: string): DbSet<T> {
        return this.join(tableName, condition);
    }

    /**
     * Orders entities in ascending order
     */
    orderBy<TKey>(selector: (entity: T) => TKey): DbSet<T> {
        const newSet = this.clone();
        newSet._queryable = this._queryable.orderBy(selector);
        return newSet;
    }

    /**
     * Orders entities in descending order
     */
    orderByDescending<TKey>(selector: (entity: T) => TKey): DbSet<T> {
        const newSet = this.clone();
        newSet._queryable = this._queryable.orderByDescending(selector);
        return newSet;
    }

    /**
     * Projects entities to a new form
     */
    select<TResult>(selector: (entity: T) => TResult): DbSet<TResult> {
        const newSet = new DbSet<TResult>(this._db, this._caller, this.tableName);
        newSet._queryable = this._queryable.select(selector) as any;
        return newSet;
    }

    /**
     * Limits the number of results
     */
    take(count: number): DbSet<T> {
        const newSet = this.clone();
        newSet._queryable = this._queryable.take(count);
        return newSet;
    }

    /**
     * Skips a number of records
     */
    skip(count: number): DbSet<T> {
        const newSet = this.clone();
        newSet._queryable = this._queryable.skip(count);
        return newSet;
    }

    /**
     * Executes the query and returns all results
     */
    async execute(): Promise<T[]> {
        const { sql, params } = this._queryable.toSQL();
        const [rows] = await this._db.execute(sql, params);
        return rows as T[];
    }

    /**
     * Executes the query and returns first result or null
     */
    async first(): Promise<T | null> {
        const results = await this.take(1).execute();
        return results[0] || null;
    }

    /**
     * Executes the query and returns the count
     */
    async count(): Promise<number> {
        const results = await this.execute();
        return results.length;
    }

    /**
     * Gets the raw SQL and parameters without executing
     * Useful for debugging
     */
    toSQL(): { sql: string; params: any[] } {
        return this._queryable.toSQL();
    }

    /**
     * Clones the current DbSet
     */
    private clone(): DbSet<T> {
        const newSet = new DbSet<T>(this._db, this._caller, this.tableName);
        newSet._queryable = this._queryable;
        return newSet;
    }
}
