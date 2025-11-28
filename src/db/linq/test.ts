import { from } from "./index";

// ============================================
// Test Entity Definitions
// ============================================

interface User {
    id: number;
    name: string;
    email: string;
    age: number;
    isActive: boolean;
    country: string;
}

// ============================================
// Basic Tests
// ============================================

console.log("=".repeat(60));
console.log("LINQ-TO-SQL LIBRARY - TEST SUITE");
console.log("=".repeat(60));
console.log("");

// Test 1: Simple WHERE
console.log("Test 1: Simple WHERE clause");
const test1 = from<User>("users")
    .where(u => u.isActive === true)
    .toSQL();
console.log("SQL:", test1.sql);
console.log("Params:", test1.params);
console.log("");

// Test 2: Complex WHERE with AND
console.log("Test 2: Complex WHERE with AND");
const test2 = from<User>("users")
    .where(u => u.age > 18 && u.isActive === true)
    .toSQL();
console.log("SQL:", test2.sql);
console.log("Params:", test2.params);
console.log("");

// Test 3: WHERE with OR
console.log("Test 3: WHERE with OR");
const test3 = from<User>("users")
    .where(u => u.age < 18 || u.age > 65)
    .toSQL();
console.log("SQL:", test3.sql);
console.log("Params:", test3.params);
console.log("");

// Test 4: SELECT specific fields
console.log("Test 4: SELECT specific fields");
const test4 = from<User>("users")
    .select(u => ({ name: u.name, email: u.email }))
    .toSQL();
console.log("SQL:", test4.sql);
console.log("Params:", test4.params);
console.log("");

// Test 5: SELECT with WHERE
console.log("Test 5: SELECT with WHERE");
const test5 = from<User>("users")
    .where(u => u.isActive === true)
    .select(u => ({ name: u.name, email: u.email }))
    .toSQL();
console.log("SQL:", test5.sql);
console.log("Params:", test5.params);
console.log("");

// Test 6: ORDER BY
console.log("Test 6: ORDER BY ASC");
const test6 = from<User>("users")
    .orderBy(u => u.name)
    .toSQL();
console.log("SQL:", test6.sql);
console.log("Params:", test6.params);
console.log("");

// Test 7: ORDER BY DESC
console.log("Test 7: ORDER BY DESC");
const test7 = from<User>("users")
    .orderByDescending(u => u.age)
    .toSQL();
console.log("SQL:", test7.sql);
console.log("Params:", test7.params);
console.log("");

// Test 8: Pagination (LIMIT)
console.log("Test 8: Pagination with LIMIT");
const test8 = from<User>("users")
    .take(10)
    .toSQL();
console.log("SQL:", test8.sql);
console.log("Params:", test8.params);
console.log("");

// Test 9: Pagination (LIMIT + OFFSET)
console.log("Test 9: Pagination with LIMIT and OFFSET");
const test9 = from<User>("users")
    .skip(20)
    .take(10)
    .toSQL();
console.log("SQL:", test9.sql);
console.log("Params:", test9.params);
console.log("");

// Test 10: Complete query
console.log("Test 10: Complete complex query");
const test10 = from<User>("users")
    .where(u => u.age > 18 && u.isActive === true)
    .select(u => ({ name: u.name, email: u.email }))
    .orderBy(u => u.name)
    .skip(0)
    .take(20)
    .toSQL();
console.log("SQL:", test10.sql);
console.log("Params:", test10.params);
console.log("");

// Test 11: JOIN
console.log("Test 11: JOIN query");
const test11 = from<User>("users")
    .join("profiles", "users.id = profiles.userId")
    .where(u => u.isActive === true)
    .toSQL();
console.log("SQL:", test11.sql);
console.log("Params:", test11.params);
console.log("");

// Test 12: Multiple ORDER BY
console.log("Test 12: Multiple ORDER BY");
const test12 = from<User>("users")
    .orderBy(u => u.country)
    .orderByDescending(u => u.age)
    .toSQL();
console.log("SQL:", test12.sql);
console.log("Params:", test12.params);
console.log("");

console.log("=".repeat(60));
console.log("ALL TESTS COMPLETED");
console.log("=".repeat(60));
