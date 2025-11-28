/**
 * LINQ-to-SQL: Type-safe TypeScript Expression to SQL Query Compiler
 * 
 * This library provides a LINQ-style fluent API that compiles TypeScript
 * expressions into optimized SQL queries using Babel AST parsing.
 * 
 * @author Senior TypeScript Developer
 * @version 1.0.0
 * 
 * @example
 * ```typescript
 * const query = from(users)
 *   .where(u => u.age > 18 && u.isActive === true)
 *   .select(u => ({ name: u.name, email: u.email }))
 *   .orderBy(u => u.name)
 *   .take(10);
 * 
 * const { sql, params } = query.toSQL();
 * // SQL: SELECT name, email FROM users WHERE age > ? AND isActive = ? ORDER BY name ASC LIMIT 10
 * // Params: [18, true]
 * ```
 */

import * as parser from "@babel/parser";
import traverse, { NodePath } from "@babel/traverse";
import * as t from "@babel/types";

// ============================================
// Core Types & Interfaces
// ============================================

/**
 * Compiled SQL query result
 */
export interface SQLQuery {
    sql: string;
    params: any[];
}

/**
 * Expression tree node types
 */
export type ExpressionNode =
    | BinaryExpressionNode
    | MemberExpressionNode
    | LiteralNode
    | CallExpressionNode
    | LogicalExpressionNode
    | UnaryExpressionNode;

/**
 * Binary expression (e.g., a > b, x === y)
 */
export interface BinaryExpressionNode {
    type: "BinaryExpression";
    operator: string;
    left: ExpressionNode;
    right: ExpressionNode;
}

/**
 * Member expression (e.g., user.name, obj.prop)
 */
export interface MemberExpressionNode {
    type: "MemberExpression";
    object: string;
    property: string;
}

/**
 * Literal value (e.g., 42, "hello", true)
 */
export interface LiteralNode {
    type: "Literal";
    value: any;
}

/**
 * Logical expression (e.g., a && b, x || y, z ?? w)
 */
export interface LogicalExpressionNode {
    type: "LogicalExpression";
    operator: "&&" | "||" | "??";
    left: ExpressionNode;
    right: ExpressionNode;
}

/**
 * Call expression (e.g., func(arg), method.call())
 */
export interface CallExpressionNode {
    type: "CallExpression";
    callee: string;
    arguments: ExpressionNode[];
}

/**
 * Unary expression (e.g., !value, -num)
 */
export interface UnaryExpressionNode {
    type: "UnaryExpression";
    operator: string;
    argument: ExpressionNode;
}

/**
 * Order direction for sorting
 */
export type OrderDirection = "ASC" | "DESC";

/**
 * Join types
 */
export type JoinType = "INNER" | "LEFT" | "RIGHT" | "FULL";

// ============================================
// AST Expression Parser
// ============================================

/**
 * Parses TypeScript arrow function expressions into an expression tree
 * Uses Babel parser to analyze the AST and extract query logic
 */
export class ExpressionParser {
    /**
     * Parse a TypeScript expression string into an expression tree
     * @param expressionString The stringified arrow function
     * @returns Parsed expression tree
     */
    static parse(expressionString: string): ExpressionNode {
        try {
            // Parse the expression using Babel
            const ast = parser.parse(`(${expressionString})`, {
                sourceType: "module",
                plugins: ["typescript"],
            });

            let resultNode: ExpressionNode | null = null;

            // Traverse the AST to find the arrow function body
            traverse(ast, {
                ArrowFunctionExpression(path) {
                    const body = path.node.body;

                    // Handle different arrow function body types
                    if (t.isBlockStatement(body)) {
                        // Arrow function with block: u => { return u.age > 18; }
                        const returnStatement = body.body.find(t.isReturnStatement);
                        if (returnStatement && returnStatement.argument) {
                            resultNode = ExpressionParser.parseNode(returnStatement.argument);
                        }
                    } else {
                        // Arrow function with expression: u => u.age > 18
                        resultNode = ExpressionParser.parseNode(body);
                    }

                    path.stop(); // Stop traversal after first arrow function
                },
            });

            if (!resultNode) {
                throw new Error("Could not parse expression");
            }

            return resultNode;
        } catch (error: any) {
            throw new Error(`Expression parsing failed: ${error.message}`);
        }
    }

    /**
     * Parse a Babel AST node recursively
     */
    private static parseNode(node: t.Node): ExpressionNode {
        if (t.isBinaryExpression(node)) {
            return {
                type: "BinaryExpression",
                operator: node.operator,
                left: this.parseNode(node.left),
                right: this.parseNode(node.right),
            };
        }

        if (t.isLogicalExpression(node)) {
            return {
                type: "LogicalExpression",
                operator: node.operator,
                left: this.parseNode(node.left),
                right: this.parseNode(node.right),
            };
        }

        if (t.isMemberExpression(node)) {
            const object = t.isIdentifier(node.object) ? node.object.name : "unknown";
            const property = t.isIdentifier(node.property) ? node.property.name : "unknown";

            return {
                type: "MemberExpression",
                object,
                property,
            };
        }

        if (t.isIdentifier(node)) {
            return {
                type: "MemberExpression",
                object: "",
                property: node.name,
            };
        }

        if (t.isNumericLiteral(node)) {
            return {
                type: "Literal",
                value: node.value,
            };
        }

        if (t.isStringLiteral(node)) {
            return {
                type: "Literal",
                value: node.value,
            };
        }

        if (t.isBooleanLiteral(node)) {
            return {
                type: "Literal",
                value: node.value,
            };
        }

        if (t.isNullLiteral(node)) {
            return {
                type: "Literal",
                value: null,
            };
        }

        if (t.isUnaryExpression(node)) {
            return {
                type: "UnaryExpression",
                operator: node.operator,
                argument: this.parseNode(node.argument),
            };
        }

        if (t.isCallExpression(node)) {
            const callee = t.isIdentifier(node.callee) ? node.callee.name : "unknown";
            const args = node.arguments.map((arg) => this.parseNode(arg as t.Expression));

            return {
                type: "CallExpression",
                callee,
                arguments: args,
            };
        }

        if (t.isObjectExpression(node)) {
            // For select projections
            return {
                type: "Literal",
                value: node,
            };
        }

        throw new Error(`Unsupported node type: ${node.type}`);
    }
}

// ============================================
// SQL Generator from Expression Tree
// ============================================

/**
 * Converts expression trees into SQL WHERE clauses
 */
export class SQLGenerator {
    private params: any[] = [];
    private paramIndex: number = 0;

    /**
     * Generate SQL WHERE clause from expression tree
     * @param expr Expression tree node
     * @returns SQL string
     */
    generateWhere(expr: ExpressionNode): string {
        this.params = [];
        this.paramIndex = 0;
        return this.visitNode(expr);
    }

    /**
     * Get collected parameters
     */
    getParams(): any[] {
        return this.params;
    }

    /**
     * Visit and convert expression node to SQL
     */
    private visitNode(node: ExpressionNode): string {
        switch (node.type) {
            case "BinaryExpression":
                return this.visitBinaryExpression(node);

            case "LogicalExpression":
                return this.visitLogicalExpression(node);

            case "MemberExpression":
                return this.visitMemberExpression(node);

            case "Literal":
                return this.visitLiteral(node);

            case "UnaryExpression":
                return this.visitUnaryExpression(node);

            case "CallExpression":
                return this.visitCallExpression(node);

            default:
                throw new Error(`Unsupported expression type: ${(node as any).type}`);
        }
    }

    private visitBinaryExpression(node: BinaryExpressionNode): string {
        const left = this.visitNode(node.left);
        const right = this.visitNode(node.right);

        // Convert TypeScript operators to SQL operators
        const sqlOperator = this.mapOperator(node.operator);

        return `${left} ${sqlOperator} ${right}`;
    }

    private visitLogicalExpression(node: LogicalExpressionNode): string {
        const left = this.visitNode(node.left);
        const right = this.visitNode(node.right);

        const sqlOperator = node.operator === "&&" ? "AND" : "OR";

        return `(${left} ${sqlOperator} ${right})`;
    }

    private visitMemberExpression(node: MemberExpressionNode): string {
        // Return just the property name (column name)
        return node.property;
    }

    private visitLiteral(node: LiteralNode): string {
        this.params.push(node.value);
        return "?";
    }

    private visitUnaryExpression(node: UnaryExpressionNode): string {
        const argument = this.visitNode(node.argument);

        if (node.operator === "!") {
            return `NOT ${argument}`;
        }

        return `${node.operator}${argument}`;
    }

    private visitCallExpression(node: CallExpressionNode): string {
        // Handle method calls like includes, startsWith, etc.
        const callee = node.callee;

        if (callee === "includes") {
            const arg = this.visitNode(node.arguments[0]);
            return `IN (${arg})`;
        }

        if (callee === "startsWith" || callee === "endsWith") {
            const pattern = callee === "startsWith" ? "%%" : "%%";
            return `LIKE ${pattern}`;
        }

        throw new Error(`Unsupported method call: ${callee}`);
    }

    private mapOperator(operator: string): string {
        const operatorMap: Record<string, string> = {
            "===": "=",
            "==": "=",
            "!==": "!=",
            "!=": "!=",
            ">": ">",
            "<": "<",
            ">=": ">=",
            "<=": "<=",
        };

        return operatorMap[operator] || operator;
    }
}

// ============================================
// Queryable Interface (LINQ-style)
// ============================================

/**
 * Type-safe queryable collection with LINQ-style fluent API
 * @template T Entity type
 */
export class Queryable<T> {
    private tableName: string;
    private whereExpression?: ExpressionNode;
    private selectFields?: string[];
    private orderByFields: Array<{ field: string; direction: OrderDirection }> = [];
    private joinClauses: Array<{ type: JoinType; table: string; on: string }> = [];
    private limitValue?: number;
    private offsetValue?: number;
    private groupByFields?: string[];
    private havingExpression?: ExpressionNode;

    constructor(tableName: string) {
        this.tableName = tableName;
    }

    /**
     * Filter records using a TypeScript predicate function
     * @param predicate Arrow function that returns boolean
     * @returns New queryable with filter applied
     * 
     * @example
     * ```typescript
     * query.where(u => u.age > 18 && u.isActive === true)
     * ```
     */
    where(predicate: (entity: T) => boolean): Queryable<T> {
        const newQuery = this.clone();
        const expressionString = predicate.toString();
        newQuery.whereExpression = ExpressionParser.parse(expressionString);
        return newQuery;
    }

    /**
     * Project (select) specific fields using TypeScript expression
     * @param selector Arrow function that returns object with selected fields
     * @returns New queryable with projection applied
     * 
     * @example
     * ```typescript
     * query.select(u => ({ name: u.name, email: u.email }))
     * query.select(u => u.name) // Select single field
     * ```
     */
    select<TResult = any>(selector: (entity: T) => TResult): Queryable<TResult> {
        const newQuery = this.clone() as unknown as Queryable<TResult>;
        const expressionString = selector.toString();

        // Parse the selector to extract field names
        const fields = this.extractSelectFields(expressionString);
        newQuery.selectFields = fields;

        return newQuery;
    }

    /**
  * Sort records in ascending order
     * @param keySelector Arrow function that returns the sort key
     * @returns New queryable with sorting applied
     * 
     * @example
     * ```typescript
     * query.orderBy(u => u.name)
     * ```
     */
    orderBy<TKey>(keySelector: (entity: T) => TKey): Queryable<T> {
        const newQuery = this.clone();
        const field = this.extractFieldName(keySelector.toString());
        newQuery.orderByFields.push({ field, direction: "ASC" });
        return newQuery;
    }

    /**
     * Sort records in descending order
     * @param keySelector Arrow function that returns the sort key
     * @returns New queryable with sorting applied
     * 
     * @example
     * ```typescript
     * query.orderByDescending(u => u.createdAt)
     * ```
     */
    orderByDescending<TKey>(keySelector: (entity: T) => TKey): Queryable<T> {
        const newQuery = this.clone();
        const field = this.extractFieldName(keySelector.toString());
        newQuery.orderByFields.push({ field, direction: "DESC" });
        return newQuery;
    }

    /**
     * Take first N records (LIMIT)
     * @param count Number of records to take
     * @returns New queryable with limit applied
     * 
     * @example
     * ```typescript
     * query.take(10) // LIMIT 10
     * ```
     */
    take(count: number): Queryable<T> {
        const newQuery = this.clone();
        newQuery.limitValue = count;
        return newQuery;
    }

    /**
     * Skip first N records (OFFSET)
     * @param count Number of records to skip
     * @returns New queryable with offset applied
     * 
     * @example
     * ```typescript
     * query.skip(20) // OFFSET 20
     * ```
     */
    skip(count: number): Queryable<T> {
        const newQuery = this.clone();
        newQuery.offsetValue = count;
        return newQuery;
    }

    /**
     * Group records by field
     * @param keySelector Arrow function that returns group key
     * @returns New queryable with grouping applied
     * 
     * @example
     * ```typescript
     * query.groupBy(u => u.country)
     * ```
     */
    groupBy<TKey>(keySelector: (entity: T) => TKey): Queryable<T> {
        const newQuery = this.clone();
        const field = this.extractFieldName(keySelector.toString());
        newQuery.groupByFields = [field];
        return newQuery;
    }

    /**
     * Filter grouped records (HAVING clause)
     * @param predicate Arrow function for having condition
     * @returns New queryable with having clause applied
     * 
     * @example
     * ```typescript
     * query.groupBy(u => u.country).having(g => g.count > 10)
     * ```
     */
    having(predicate: (group: any) => boolean): Queryable<T> {
        const newQuery = this.clone();
        const expressionString = predicate.toString();
        newQuery.havingExpression = ExpressionParser.parse(expressionString);
        return newQuery;
    }

    /**
     * Perform inner join with another table
     * @param otherTable Table name to join
     * @param on Join condition
     * @returns New queryable with join applied
     * 
     * @example
     * ```typescript
     * query.join("profiles", "users.id = profiles.userId")
     * ```
     */
    join(otherTable: string, on: string): Queryable<T> {
        const newQuery = this.clone();
        newQuery.joinClauses.push({ type: "INNER", table: otherTable, on });
        return newQuery;
    }

    /**
     * Perform left join with another table
     * @param otherTable Table name to join
     * @param on Join condition
     * @returns New queryable with join applied
     */
    leftJoin(otherTable: string, on: string): Queryable<T> {
        const newQuery = this.clone();
        newQuery.joinClauses.push({ type: "LEFT", table: otherTable, on });
        return newQuery;
    }

    /**
     * Compile the query to SQL
     * @returns SQL query with parameterized values
     * 
     * @example
     * ```typescript
     * const { sql, params } = query.toSQL();
     * await db.execute(sql, params);
     * ```
     */
    toSQL(): SQLQuery {
        const sqlGenerator = new SQLGenerator();
        let sql = "SELECT ";

        // SELECT clause
        if (this.selectFields && this.selectFields.length > 0) {
            sql += this.selectFields.join(", ");
        } else {
            sql += "*";
        }

        // FROM clause
        sql += ` FROM ${this.tableName}`;

        // JOIN clauses
        for (const join of this.joinClauses) {
            sql += ` ${join.type} JOIN ${join.table} ON ${join.on}`;
        }

        // WHERE clause
        if (this.whereExpression) {
            const whereSQL = sqlGenerator.generateWhere(this.whereExpression);
            sql += ` WHERE ${whereSQL}`;
        }

        // GROUP BY clause
        if (this.groupByFields && this.groupByFields.length > 0) {
            sql += ` GROUP BY ${this.groupByFields.join(", ")}`;
        }

        // HAVING clause
        if (this.havingExpression) {
            const havingSQL = sqlGenerator.generateWhere(this.havingExpression);
            sql += ` HAVING ${havingSQL}`;
        }

        // ORDER BY clause
        if (this.orderByFields.length > 0) {
            const orderClauses = this.orderByFields.map(
                (o) => `${o.field} ${o.direction}`
            );
            sql += ` ORDER BY ${orderClauses.join(", ")}`;
        }

        // LIMIT clause
        if (this.limitValue !== undefined) {
            sql += ` LIMIT ${this.limitValue}`;
        }

        // OFFSET clause
        if (this.offsetValue !== undefined) {
            sql += ` OFFSET ${this.offsetValue}`;
        }

        return {
            sql,
            params: sqlGenerator.getParams(),
        };
    }

    /**
     * Clone the current queryable
     */
    private clone(): Queryable<T> {
        const cloned = new Queryable<T>(this.tableName);
        cloned.whereExpression = this.whereExpression;
        cloned.selectFields = this.selectFields ? [...this.selectFields] : undefined;
        cloned.orderByFields = [...this.orderByFields];
        cloned.joinClauses = [...this.joinClauses];
        cloned.limitValue = this.limitValue;
        cloned.offsetValue = this.offsetValue;
        cloned.groupByFields = this.groupByFields;
        cloned.havingExpression = this.havingExpression;
        return cloned;
    }

    /**
     * Extract field names from select expression
     */
    private extractSelectFields(expression: string): string[] {
        try {
            const ast = parser.parse(`(${expression})`, {
                sourceType: "module",
                plugins: ["typescript"],
            });

            const fields: string[] = [];

            traverse(ast, {
                ObjectProperty(path) {
                    if (t.isIdentifier(path.node.key)) {
                        fields.push(path.node.key.name);
                    }
                },
                MemberExpression(path) {
                    if (t.isIdentifier(path.node.property)) {
                        const fieldName = path.node.property.name;
                        if (!fields.includes(fieldName)) {
                            fields.push(fieldName);
                        }
                    }
                },
            });

            return fields.length > 0 ? fields : ["*"];
        } catch {
            return ["*"];
        }
    }

    /**
     * Extract single field name from expression
     */
    private extractFieldName(expression: string): string {
        try {
            const ast = parser.parse(`(${expression})`, {
                sourceType: "module",
                plugins: ["typescript"],
            });

            let fieldName = "";

            traverse(ast, {
                MemberExpression(path) {
                    if (t.isIdentifier(path.node.property)) {
                        fieldName = path.node.property.name;
                        path.stop();
                    }
                },
            });

            return fieldName || "id";
        } catch {
            return "id";
        }
    }
}

// ============================================
// Factory Function (LINQ-style entry point)
// ============================================

/**
 * Create a new queryable collection from a table
 * @param tableName Name of the database table
 * @returns Queryable instance
 * 
 * @example
 * ```typescript
 * const query = from<User>("users")
 *   .where(u => u.age > 18)
 *   .select(u => ({ name: u.name, email: u.email }))
 *   .orderBy(u => u.name)
 *   .take(10);
 * 
 * const { sql, params } = query.toSQL();
 * ```
 */
export function from<T>(tableName: string): Queryable<T> {
    return new Queryable<T>(tableName);
}
