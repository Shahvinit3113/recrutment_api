import {
  QueryExecutor,
  QueryResult,
  PaginatedResult,
} from "@/utils/database/queryExecutor";
import {
  QueryBuilder,
  QueryOptions,
  InsertOptions,
  UpdateOptions,
  DeleteOptions,
} from "@/utils/database/queryBuilder";
import { AppError } from "@/utils/errors/AppError";
import { ErrorCodes } from "@/utils/errors/errorCodes";
import { RowDataPacket } from "mysql2";

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

/**
 * Base repository
 */
export abstract class BaseRepository<T = RowDataPacket> {
  protected tableName: string;
  protected executor: QueryExecutor;

  constructor(tableName: string, executor?: QueryExecutor) {
    this.tableName = tableName;
    this.executor = executor || new QueryExecutor();
  }

  public async findById(id: number, fields?: string[]): Promise<T | null> {
    const options: QueryOptions = {
      table: this.tableName,
      fields,
      where: { id },
    };

    const { query, values } = QueryBuilder.buildSelectQuery(options);
    return await this.executor.selectOne<T>(query, values);
  }

  public async findOne(
    where: Record<string, any>,
    fields?: string[]
  ): Promise<T | null> {
    const options: QueryOptions = {
      table: this.tableName,
      fields,
      where,
    };

    const { query, values } = QueryBuilder.buildSelectQuery(options);
    return await this.executor.selectOne<T>(query, values);
  }

  public async findMany(
    where?: Record<string, any>,
    options?: {
      fields?: string[];
      orderBy?: Array<{ field: string; direction: "ASC" | "DESC" }>;
      limit?: number;
      offset?: number;
    }
  ): Promise<T[]> {
    const queryOptions: QueryOptions = {
      table: this.tableName,
      fields: options?.fields,
      where,
      orderBy: options?.orderBy,
      limit: options?.limit,
      offset: options?.offset,
    };

    const { query, values } = QueryBuilder.buildSelectQuery(queryOptions);
    return await this.executor.select<T[]>(query, values);
  }

  public async findWithPagination(
    where?: Record<string, any>,
    pagination: PaginationOptions = {},
    options?: {
      fields?: string[];
      orderBy?: Array<{ field: string; direction: "ASC" | "DESC" }>;
    }
  ): Promise<PaginatedResult<T[]>> {
    const { page = 1, limit = 10 } = pagination;

    const queryOptions: QueryOptions = {
      table: this.tableName,
      fields: options?.fields,
      where,
      orderBy: options?.orderBy,
    };

    const { query: baseQuery, values } =
      QueryBuilder.buildSelectQuery(queryOptions);
    const { query: countQuery } = QueryBuilder.buildCountQuery({
      table: this.tableName,
      where,
    });

    return await this.executor.paginate<T[]>(
      baseQuery,
      countQuery,
      values,
      page,
      limit
    );
  }

  public async create(
    data: Record<string, any>
  ): Promise<{ insertId: number; affectedRows: number }> {
    const options: InsertOptions = {
      table: this.tableName,
      data,
    };

    const { query, values } = QueryBuilder.buildInsertQuery(options);
    return await this.executor.insert(query, values);
  }

  public async createMany(
    data: Record<string, any>[]
  ): Promise<{ insertId: number; affectedRows: number }> {
    if (data.length === 0) {
      throw new AppError(
        ErrorCodes.INVALID_INPUT,
        400,
        "Cannot insert empty data array"
      );
    }

    const options: InsertOptions = {
      table: this.tableName,
      data,
    };

    const { query, values } = QueryBuilder.buildInsertQuery(options);
    return await this.executor.insert(query, values);
  }

  public async updateById(
    id: number,
    data: Record<string, any>
  ): Promise<{ affectedRows: number; changedRows: number }> {
    const options: UpdateOptions = {
      table: this.tableName,
      data,
      where: { id },
    };

    const { query, values } = QueryBuilder.buildUpdateQuery(options);
    return await this.executor.update(query, values);
  }

  public async updateMany(
    where: Record<string, any>,
    data: Record<string, any>
  ): Promise<{ affectedRows: number; changedRows: number }> {
    const options: UpdateOptions = {
      table: this.tableName,
      data,
      where,
    };

    const { query, values } = QueryBuilder.buildUpdateQuery(options);
    return await this.executor.update(query, values);
  }

  public async deleteById(id: number): Promise<{ affectedRows: number }> {
    const options: DeleteOptions = {
      table: this.tableName,
      where: { id },
    };

    const { query, values } = QueryBuilder.buildDeleteQuery(options);
    return await this.executor.delete(query, values);
  }

  public async deleteMany(
    where: Record<string, any>
  ): Promise<{ affectedRows: number }> {
    const options: DeleteOptions = {
      table: this.tableName,
      where,
    };

    const { query, values } = QueryBuilder.buildDeleteQuery(options);
    return await this.executor.delete(query, values);
  }

  public async exists(where: Record<string, any>): Promise<boolean> {
    const result = await this.findOne(where, ["id"]);
    return result !== null;
  }

  public async count(where?: Record<string, any>): Promise<number> {
    const { query, values } = QueryBuilder.buildCountQuery({
      table: this.tableName,
      where,
    });

    const result = await this.executor.selectOne<{ total: number }>(
      query,
      values
    );
    return result?.total || 0;
  }

  public async executeRawQuery<R = T[]>(
    query: string,
    values: any[] = []
  ): Promise<R> {
    return await this.executor.select<R>(query, values);
  }

  public async executeTransaction<R>(
    callback: (executor: QueryExecutor) => Promise<R>
  ): Promise<R> {
    return await this.executor.transaction(callback);
  }
}
