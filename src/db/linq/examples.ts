/**
 * COMPREHENSIVE USAGE EXAMPLES FOR LINQ-TO-SQL LIBRARY
 * 
 * This file demonstrates all features of the TypeScript LINQ-to-SQL query builder
 * with real-world examples and best practices.
 */

import { from, Queryable } from "./index";

// ============================================
// Entity Type Definitions
// ============================================

interface User {
    id: number;
    name: string;
    email: string;
    age: number;
    isActive: boolean;
    country: string;
    createdAt: Date;
    deletedAt: Date | null;
}

interface Order {
    id: number;
    userId: number;
    totalAmount: number;
    status: string;
    createdAt: Date;
}

interface Profile {
    id: number;
    userId: number;
    bio: string;
    avatar: string;
}

// ============================================
// 1. BASIC QUERIES
// ============================================

/**
 * Example 1: Simple WHERE clause
 */
function example1_SimpleWhere() {
    const query = from<User>("users")
        .where(u => u.isActive === true);

    const { sql, params } = query.toSQL();
    console.log(sql);    // SELECT * FROM users WHERE isActive = ?
    console.log(params); // [true]
}

/**
 * Example 2: Complex WHERE with multiple conditions
 */
function example2_ComplexWhere() {
    const query = from<User>("users")
        .where(u => u.age > 18 && u.isActive === true && u.country === "USA");

    const { sql, params } = query.toSQL();
    // SELECT * FROM users WHERE (age > ? AND (isActive = ? AND country = ?))
    // [18, true, "USA"]
}

/**
 * Example 3: WHERE with OR logic
 */
function example3_WhereWithOr() {
    const query = from<User>("users")
        .where(u => u.age < 18 || u.age > 65);

    const { sql, params } = query.toSQL();
    // SELECT * FROM users WHERE (age < ? OR age > ?)
    // [18, 65]
}

// ============================================
// 2. SELECT PROJECTIONS
// ============================================

/**
 * Example 4: Select specific fields
 */
function example4_SelectFields() {
    const query = from<User>("users")
        .select(u => ({ name: u.name, email: u.email }));

    const { sql, params } = query.toSQL();
    // SELECT name, email FROM users
}

/**
 * Example 5: Select with WHERE
 */
function example5_SelectWithWhere() {
    const query = from<User>("users")
        .where(u => u.isActive === true)
        .select(u => ({ name: u.name, email: u.email }));

    const { sql, params } = query.toSQL();
    // SELECT name, email FROM users WHERE isActive = ?
    // [true]
}

// ============================================
// 3. SORTING (ORDER BY)
// ============================================

/**
 * Example 6: Order by single field ascending
 */
function example6_OrderBy() {
    const query = from<User>("users")
        .orderBy(u => u.name);

    const { sql, params } = query.toSQL();
    // SELECT * FROM users ORDER BY name ASC
}

/**
 * Example 7: Order by descending
 */
function example7_OrderByDescending() {
    const query = from<User>("users")
        .orderByDescending(u => u.createdAt);

    const { sql, params } = query.toSQL();
    // SELECT * FROM users ORDER BY createdAt DESC
}

/**
 * Example 8: Multiple order by (chaining)
 */
function example8_MultipleOrderBy() {
    const query = from<User>("users")
        .orderBy(u => u.country)
        .orderByDescending(u => u.age);

    const { sql, params } = query.toSQL();
    // SELECT * FROM users ORDER BY country ASC, age DESC
}

// ============================================
// 4. PAGINATION
// ============================================

/**
 * Example 9: LIMIT (take)
 */
function example9_Take() {
    const query = from<User>("users")
        .take(10);

    const { sql, params } = query.toSQL();
    // SELECT * FROM users LIMIT 10
}

/**
 * Example 10: OFFSET (skip)
 */
function example10_Skip() {
    const query = from<User>("users")
        .skip(20)
        .take(10);

    const { sql, params } = query.toSQL();
    // SELECT * FROM users LIMIT 10 OFFSET 20
}

/**
 * Example 11: Complete pagination query
 */
function example11_Pagination() {
    const page = 2;
    const pageSize = 20;

    const query = from<User>("users")
        .where(u => u.isActive === true)
        .orderBy(u => u.name)
        .skip((page - 1) * pageSize)
        .take(pageSize);

    const { sql, params } = query.toSQL();
    // SELECT * FROM users WHERE isActive = ? ORDER BY name ASC LIMIT 20 OFFSET 20
}

// ============================================
// 5. JOINS
// ============================================

/**
 * Example 12: INNER JOIN
 */
function example12_InnerJoin() {
    const query = from<User>("users")
        .join("profiles", "users.id = profiles.userId")
        .select(u => ({ name: u.name }));

    const { sql, params } = query.toSQL();
    // SELECT name FROM users INNER JOIN profiles ON users.id = profiles.userId
}

/**
 * Example 13: LEFT JOIN
 */
function example13_LeftJoin() {
    const query = from<User>("users")
        .leftJoin("orders", "users.id = orders.userId")
        .where(u => u.isActive === true);

    const { sql, params } = query.toSQL();
    // SELECT * FROM users LEFT JOIN orders ON users.id = orders.userId WHERE isActive = ?
}

/**
 * Example 14: Multiple JOINs
 */
function example14_MultipleJoins() {
    const query = from<User>("users")
        .join("profiles", "users.id = profiles.userId")
        .leftJoin("orders", "users.id = orders.userId");

    const { sql, params } = query.toSQL();
    // SELECT * FROM users 
    // INNER JOIN profiles ON users.id = profiles.userId 
    // LEFT JOIN orders ON users.id = orders.userId
}

// ============================================
// 6. GROUP BY & AGGREGATES
// ============================================

/**
 * Example 15: GROUP BY
 */
function example15_GroupBy() {
    const query = from<User>("users")
        .groupBy(u => u.country);

    const { sql, params } = query.toSQL();
    // SELECT * FROM users GROUP BY country
}

/**
 * Example 16: GROUP BY with HAVING
 */
function example16_GroupByHaving() {
    const query = from<User>("users")
        .groupBy(u => u.country)
        .having(g => g.count > 10);

    const { sql, params } = query.toSQL();
    // SELECT * FROM users GROUP BY country HAVING count > ?
    // [10]
}

// ============================================
// 7. COMPLEX REAL-WORLD QUERIES
// ============================================

/**
 * Example 17: E-commerce - Find active users with orders
 */
function example17_ActiveUsersWithOrders() {
    const query = from<User>("users")
        .join("orders", "users.id = orders.userId")
        .where(u => u.isActive === true)
        .select(u => ({ name: u.name, email: u.email }))
        .orderBy(u => u.name)
        .take(50);

    const { sql, params } = query.toSQL();
    /*
    SELECT name, email FROM users 
    INNER JOIN orders ON users.id = orders.userId 
    WHERE isActive = ? 
    ORDER BY name ASC 
    LIMIT 50
    */
}

/**
 * Example 18: User search with filters
 */
function example18_UserSearch(searchTerm: string, minAge: number) {
    const query = from<User>("users")
        .where(u => u.age >= minAge && u.isActive === true)
        .select(u => ({ name: u.name, email: u.email, age: u.age }))
        .orderBy(u => u.name)
        .take(20);

    const { sql, params } = query.toSQL();
    /*
    SELECT name, email, age FROM users 
    WHERE (age >= ? AND isActive = ?) 
    ORDER BY name ASC 
    LIMIT 20
    */
}

/**
 * Example 19: Analytics - Users by country
 */
function example19_UsersByCountry() {
    const query = from<User>("users")
        .where(u => u.isActive === true)
        .groupBy(u => u.country);

    const { sql, params } = query.toSQL();
    // SELECT * FROM users WHERE isActive = ? GROUP BY country
}

/**
 * Example 20: Dashboard - Recent users
 */
function example20_RecentUsers(days: number) {
    const query = from<User>("users")
        .where(u => u.deletedAt === null && u.isActive === true)
        .orderByDescending(u => u.createdAt)
        .take(10);

    const { sql, params } = query.toSQL();
    /*
    SELECT * FROM users 
    WHERE (deletedAt = ? AND isActive = ?) 
    ORDER BY createdAt DESC 
    LIMIT 10
    */
}

// ============================================
// 8. INTEGRATION WITH DATABASE
// ============================================

/**
 * Example 21: Execute query with database connection
 */
async function example21_DatabaseExecution(db: any) {
    const query = from<User>("users")
        .where(u => u.age > 18)
        .select(u => ({ name: u.name, email: u.email }))
        .orderBy(u => u.name)
        .take(10);

    const { sql, params } = query.toSQL();

    // Execute with your database driver
    const [rows] = await db.execute(sql, params);
    return rows;
}

/**
 * Example 22: Reusable query builder function
 */
function getUsersQuery(filters: {
    isActive?: boolean;
    minAge?: number;
    country?: string;
    limit?: number;
}) {
    let query = from<User>("users");

    // Apply filters conditionally
    if (filters.isActive !== undefined) {
        const isActive = filters.isActive;
        query = query.where(u => u.isActive === isActive);
    }

    if (filters.minAge !== undefined) {
        const minAge = filters.minAge;
        query = query.where(u => u.age >= minAge);
    }

    if (filters.country) {
        const country = filters.country;
        query = query.where(u => u.country === country);
    }

    query = query.orderBy(u => u.name);

    if (filters.limit) {
        const limit = filters.limit;
        query = query.take(limit);
    }

    return query;
}

/**
 * Example 23: Building dynamic queries
 */
function example23_DynamicQuery(options: {
    searchTerm?: string;
    sortBy?: keyof User;
    sortOrder?: "ASC" | "DESC";
    page?: number;
    pageSize?: number;
}) {
    let query = from<User>("users");

    // Dynamic WHERE
    query = query.where(u => u.isActive === true);

    // Dynamic ORDER BY
    if (options.sortBy && options.sortOrder === "DESC") {
        // Note: In real implementation, you'd need dynamic orderBy
        query = query.orderByDescending(u => u[options.sortBy!]);
    } else if (options.sortBy) {
        query = query.orderBy(u => u[options.sortBy!]);
    }

    // Dynamic PAGINATION
    const page = options.page || 1;
    const pageSize = options.pageSize || 20;
    query = query.skip((page - 1) * pageSize).take(pageSize);

    return query.toSQL();
}

// ============================================
// 9. TYPE-SAFE REPOSITORY PATTERN
// ============================================

/**
 * Example 24: Generic repository with LINQ queries
 */
class LinqRepository<T> {
    constructor(private tableName: string) { }

    findAll(): Queryable<T> {
        return from<T>(this.tableName);
    }

    findById(id: number): Queryable<T> {
        return from<T>(this.tableName)
            .where((entity: any) => entity.id === id)
            .take(1);
    }

    findActive(): Queryable<T> {
        return from<T>(this.tableName)
            .where((entity: any) => entity.isActive === true);
    }

    paginate(page: number, pageSize: number): Queryable<T> {
        return from<T>(this.tableName)
            .skip((page - 1) * pageSize)
            .take(pageSize);
    }
}

/**
 * Example 25: Using the repository
 */
function example25_UsingRepository() {
    const userRepo = new LinqRepository<User>("users");

    // Get all active users
    const activeUsers = userRepo.findActive()
        .orderBy(u => u.name)
        .toSQL();

    // Paginated results
    const page2 = userRepo.paginate(2, 20)
        .where(u => u.country === "USA")
        .toSQL();

    console.log(activeUsers);
    console.log(page2);
}

// ============================================
// Export examples for testing
// ============================================

export {
    example1_SimpleWhere,
    example2_ComplexWhere,
    example11_Pagination,
    example17_ActiveUsersWithOrders,
    LinqRepository,
};
