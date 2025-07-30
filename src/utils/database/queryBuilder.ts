import { FieldPacket, ResultSetHeader, RowDataPacket } from 'mysql2';

export interface QueryOptions {
  table: string;
  fields?: string[];
  where?: Record<string, any>;
  joins?: Join[];
  orderBy?: OrderBy[];
  groupBy?: string[];
  having?: Record<string, any>;
  limit?: number;
  offset?: number;
}

export interface Join {
  type: 'INNER' | 'LEFT' | 'RIGHT' | 'FULL';
  table: string;
  on: string;
}

export interface OrderBy {
  field: string;
  direction: 'ASC' | 'DESC';
}

export interface InsertOptions {
  table: string;
  data: Record<string, any> | Record<string, any>[];
  onDuplicateUpdate?: Record<string, any>;
}

export interface UpdateOptions {
  table: string;
  data: Record<string, any>;
  where: Record<string, any>;
}

export interface DeleteOptions {
  table: string;
  where: Record<string, any>;
}
/**
 * A generic SQL query builder class
 */
export class QueryBuilder {
    /**
     * 
     * @param identifier 
     * @returns 
     */
  private static escapeIdentifier(identifier: string): string {
    return `\`${identifier.replace(/`/g, '``')}\``;
  }

  /**
   * 
   * @param where 
   * @returns 
   */
  private static buildWhereClause(where: Record<string, any>): { clause: string; values: any[] } {
    if (!where || Object.keys(where).length === 0) {
      return { clause: '', values: [] };
    }

    const conditions: string[] = [];
    const values: any[] = [];

    Object.entries(where).forEach(([key, value]) => {
      const escapedKey = this.escapeIdentifier(key);
      
      if (value === null) {
        conditions.push(`${escapedKey} IS NULL`);
      } else if (value === undefined) {
        // Skip undefined values
        return;
      } else if (Array.isArray(value)) {
        if (value.length === 0) {
          conditions.push('1 = 0'); // Always false condition
        } else {
          conditions.push(`${escapedKey} IN (${value.map(() => '?').join(', ')})`);
          values.push(...value);
        }
      } else if (typeof value === 'object' && value.operator) {
        // Support for complex operators like { operator: '>=', value: 18 }
        conditions.push(`${escapedKey} ${value.operator} ?`);
        values.push(value.value);
      } else {
        conditions.push(`${escapedKey} = ?`);
        values.push(value);
      }
    });

    return {
      clause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
      values
    };
  }

  /**
   * 
   * @param options 
   * @returns 
   */
  public static buildSelectQuery(options: QueryOptions): { query: string; values: any[] } {
    const {
      table,
      fields = ['*'],
      where,
      joins = [],
      orderBy = [],
      groupBy = [],
      having,
      limit,
      offset
    } = options;

    let query = 'SELECT ';
    
    // Fields
    if (fields.includes('*')) {
      query += '*';
    } else {
      query += fields.map(field => this.escapeIdentifier(field)).join(', ');
    }

    // From clause
    query += ` FROM ${this.escapeIdentifier(table)}`;

    // Joins
    joins.forEach(join => {
      query += ` ${join.type} JOIN ${this.escapeIdentifier(join.table)} ON ${join.on}`;
    });

    const values: any[] = [];

    // Where clause
    const whereClause = this.buildWhereClause(where || {});
    if (whereClause.clause) {
      query += ` ${whereClause.clause}`;
      values.push(...whereClause.values);
    }

    // Group by
    if (groupBy.length > 0) {
      query += ` GROUP BY ${groupBy.map(field => this.escapeIdentifier(field)).join(', ')}`;
    }

    // Having clause
    if (having) {
      const havingClause = this.buildWhereClause(having);
      if (havingClause.clause) {
        query += ` HAVING ${havingClause.clause.replace('WHERE', '')}`;
        values.push(...havingClause.values);
      }
    }

    // Order by
    if (orderBy.length > 0) {
      const orderClauses = orderBy.map(order => 
        `${this.escapeIdentifier(order.field)} ${order.direction}`
      );
      query += ` ORDER BY ${orderClauses.join(', ')}`;
    }

    // Limit and offset
    if (limit !== undefined) {
      query += ` LIMIT ?`;
      values.push(limit);
      
      if (offset !== undefined) {
        query += ` OFFSET ?`;
        values.push(offset);
      }
    }

    return { query, values };
  }

  /**
   * 
   * @param options 
   * @returns 
   */
  public static buildInsertQuery(options: InsertOptions): { query: string; values: any[] } {
    const { table, data, onDuplicateUpdate } = options;
    
    if (Array.isArray(data)) {
      return this.buildBatchInsertQuery(table, data, onDuplicateUpdate);
    }

    const fields = Object.keys(data);
    const values = Object.values(data);
    
    let query = `INSERT INTO ${this.escapeIdentifier(table)} `;
    query += `(${fields.map(field => this.escapeIdentifier(field)).join(', ')}) `;
    query += `VALUES (${fields.map(() => '?').join(', ')})`;

    if (onDuplicateUpdate) {
      const updateClauses = Object.entries(onDuplicateUpdate).map(([key, value]) => {
        if (typeof value === 'string' && value.startsWith('VALUES(')) {
          return `${this.escapeIdentifier(key)} = ${value}`;
        }
        values.push(value);
        return `${this.escapeIdentifier(key)} = ?`;
      });
      query += ` ON DUPLICATE KEY UPDATE ${updateClauses.join(', ')}`;
    }

    return { query, values };
  }

  /**
   * 
   * @param table 
   * @param data 
   * @param onDuplicateUpdate 
   * @returns 
   */
  private static buildBatchInsertQuery(
    table: string,
    data: Record<string, any>[],
    onDuplicateUpdate?: Record<string, any>
  ): { query: string; values: any[] } {
    if (data.length === 0) {
      throw new Error('Cannot insert empty data array');
    }

    const fields = Object.keys(data[0]);
    const values: any[] = [];

    let query = `INSERT INTO ${this.escapeIdentifier(table)} `;
    query += `(${fields.map(field => this.escapeIdentifier(field)).join(', ')}) VALUES `;

    const valueClauses = data.map(row => {
      const rowValues = fields.map(field => row[field]);
      values.push(...rowValues);
      return `(${fields.map(() => '?').join(', ')})`;
    });

    query += valueClauses.join(', ');

    if (onDuplicateUpdate) {
      const updateClauses = Object.entries(onDuplicateUpdate).map(([key, value]) => {
        if (typeof value === 'string' && value.startsWith('VALUES(')) {
          return `${this.escapeIdentifier(key)} = ${value}`;
        }
        values.push(value);
        return `${this.escapeIdentifier(key)} = ?`;
      });
      query += ` ON DUPLICATE KEY UPDATE ${updateClauses.join(', ')}`;
    }

    return { query, values };
  }

  /**
   * 
   * @param options 
   * @returns 
   */
  public static buildUpdateQuery(options: UpdateOptions): { query: string; values: any[] } {
    const { table, data, where } = options;

    const fields = Object.keys(data);
    const values = Object.values(data);

    let query = `UPDATE ${this.escapeIdentifier(table)} SET `;
    query += fields.map(field => `${this.escapeIdentifier(field)} = ?`).join(', ');

    const whereClause = this.buildWhereClause(where);
    if (!whereClause.clause) {
      throw new Error('UPDATE queries must include a WHERE clause for safety');
    }

    query += ` ${whereClause.clause}`;
    values.push(...whereClause.values);

    return { query, values };
  }

  /**
   * 
   * @param options 
   * @returns 
   */
  public static buildDeleteQuery(options: DeleteOptions): { query: string; values: any[] } {
    const { table, where } = options;

    let query = `DELETE FROM ${this.escapeIdentifier(table)}`;

    const whereClause = this.buildWhereClause(where);
    if (!whereClause.clause) {
      throw new Error('DELETE queries must include a WHERE clause for safety');
    }

    query += ` ${whereClause.clause}`;

    return { query, values: whereClause.values };
  }

  /**
   * 
   * @param options 
   * @returns 
   */
  public static buildCountQuery(options: Omit<QueryOptions, 'fields' | 'orderBy' | 'limit' | 'offset'>): { query: string; values: any[] } {
    const countOptions: QueryOptions = {
      ...options,
      fields: ['COUNT(*) as total']
    };

    return this.buildSelectQuery(countOptions);
  }
}