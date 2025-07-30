import { PoolConnection, RowDataPacket, ResultSetHeader, FieldPacket } from 'mysql2/promise';
import { db } from './connection';
import { AppError } from '@/utils/errors/AppError';
import { ErrorCodes } from '@/utils/errors/errorCodes';
import { logger } from '@/utils/logger';

export interface QueryResult<T = RowDataPacket[]> {
  data: T;
  fields?: FieldPacket[];
  affectedRows?: number;
  insertId?: number;
  changedRows?: number;
}

export interface PaginatedResult<T = RowDataPacket[]> {
  data: T;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * 
 */
export class QueryExecutor {
  private connection?: PoolConnection;

  constructor(connection?: PoolConnection) {
    this.connection = connection;
  }

  private async getConnection(): Promise<PoolConnection> {
    if (this.connection) {
      return this.connection;
    }
    return await db.getConnection();
  }

  private async releaseConnection(connection: PoolConnection): Promise<void> {
    if (!this.connection) {
      connection.release();
    }
  }

  public async execute<T = RowDataPacket[]>(
    query: string,
    values: any[] = []
  ): Promise<QueryResult<T>> {
    let connection: PoolConnection | null = null;
    const startTime = Date.now();

    try {
      connection = await this.getConnection();
      
      logger.debug('Executing query:', { query, values });
      
      const [rows, fields] = await connection.execute(query, values);
      
      const executionTime = Date.now() - startTime;
      logger.debug(`Query executed in ${executionTime}ms`);

      if (Array.isArray(rows)) {
        return {
          data: rows as T,
          fields
        };
      } else {
        const resultHeader = rows as ResultSetHeader;
        return {
          data: [] as unknown as T,
          affectedRows: resultHeader.affectedRows,
          insertId: resultHeader.insertId,
          changedRows: resultHeader.changedRows
        };
      }
    } catch (error: any) {
      logger.error('Database query error:', {
        query,
        values,
        error: error.message,
        stack: error.stack
      });

      // Map MySQL errors to application errors
      if (error.code === 'ER_DUP_ENTRY') {
        throw new AppError(ErrorCodes.DUPLICATE_ENTRY, 409, error.message);
      } else if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        throw new AppError(ErrorCodes.FOREIGN_KEY_CONSTRAINT, 400, error.message);
      } else if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        throw new AppError(ErrorCodes.FOREIGN_KEY_CONSTRAINT, 409, error.message);
      } else {
        throw new AppError(ErrorCodes.DATABASE_ERROR, 500, 'Database operation failed', error);
      }
    } finally {
      if (connection) {
        await this.releaseConnection(connection);
      }
    }
  }

  public async select<T = RowDataPacket[]>(
    query: string,
    values: any[] = []
  ): Promise<T> {
    const result = await this.execute<T>(query, values);
    return result.data;
  }

  public async selectOne<T = RowDataPacket>(
    query: string,
    values: any[] = []
  ): Promise<T | null> {
    const result = await this.select<T[]>(query, values);
    return result.length > 0 ? result[0] : null;
  }

  public async insert(
    query: string,
    values: any[] = []
  ): Promise<{ insertId: number; affectedRows: number }> {
    const result = await this.execute(query, values);
    return {
      insertId: result.insertId || 0,
      affectedRows: result.affectedRows || 0
    };
  }

  public async update(
    query: string,
    values: any[] = []
  ): Promise<{ affectedRows: number; changedRows: number }> {
    const result = await this.execute(query, values);
    return {
      affectedRows: result.affectedRows || 0,
      changedRows: result.changedRows || 0
    };
  }

  public async delete(
    query: string,
    values: any[] = []
  ): Promise<{ affectedRows: number }> {
    const result = await this.execute(query, values);
    return {
      affectedRows: result.affectedRows || 0
    };
  }

  public async paginate<T = RowDataPacket[]>(
    baseQuery: string,
    countQuery: string,
    values: any[] = [],
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<T>> {
    const offset = (page - 1) * limit;
    
    // Execute count query to get total records
    const totalResult = await this.selectOne<{ total: number }>(countQuery, values);
    const total = totalResult?.total || 0;
    
    // Execute main query with pagination
    const paginatedQuery = `${baseQuery} LIMIT ? OFFSET ?`;
    const data = await this.select<T>(paginatedQuery, [...values, limit, offset]);
    
    const totalPages = Math.ceil(total / limit);
    
    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  public async transaction<T>(
    callback: (executor: QueryExecutor) => Promise<T>
  ): Promise<T> {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const transactionExecutor = new QueryExecutor(connection);
      const result = await callback(transactionExecutor);
      
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

export const queryExecutor = new QueryExecutor();