import { DatabaseConnection } from "@/db/connection/connection";
import { BaseQueries } from "@/db/queries/base/base.query";
import { inject, injectable } from "inversify";
import { TYPES } from "@/core/container/types";
import { IBaseEntities } from "@/data/entities/base-entities";

export interface IBaseRepository<T> {
  getAll(params: any[], columns?: [keyof T]): Promise<T[]>;
  getById(id: string, params: any[], columns?: [keyof T]): Promise<T | null>;
  create(entity: T): Promise<T>;
  update(entity: T, id: string): Promise<T>;
  softDelete(id: string): Promise<boolean>;
  hardDelete(id: string): Promise<boolean>;
  softDeleteMultiple(ids: string[]): Promise<boolean>;
  hardDeleteMultiple(ids: string[]): Promise<boolean>;
}

/**
 * Base repository implementation providing common CRUD operations
 * @template T - Entity type that extends IBaseEntity
 */
@injectable()
export class BaseRespository<T extends IBaseEntities, Q extends BaseQueries<T>>
  implements IBaseRepository<T>
{
  protected readonly queries: Q;
  protected readonly _db: DatabaseConnection;

  constructor(
    @inject(TYPES.DatabaseConnection) db: DatabaseConnection,
    query: Q
  ) {
    this._db = db;
    this.queries = query;
  }

  async getAll(params: any[], columns?: [keyof T]): Promise<T[]> {
    const [rows] = await this._db.execute(this.queries.getAll(columns), params);
    return rows as T[];
  }

  async getById(
    id: string,
    params: any[],
    columns?: [keyof T]
  ): Promise<T | null> {
    const [rows] = await this._db.execute(this.queries.getById(columns), [
      id,
      ...params,
    ]);
    const result = (rows as T[])[0];
    return result || null;
  }

  async create(entity: T): Promise<T> {
    const query = this.queries.create(entity);
    const values = Object.values(entity).map((value) =>
      value === undefined ? null : value
    );
    await this._db.execute(query, values);
    return entity;
  }

  async update(entity: T, id: string): Promise<T> {
    const query = this.queries.update(entity);
    const values = [...Object.values(entity).slice(1), id];
    await this._db.execute(query, values);
    return entity;
  }

  async softDelete(id: string): Promise<boolean> {
    const query = this.queries.softDelete();
    await this._db.execute(query, [id]);

    return true;
  }

  async hardDelete(id: string): Promise<boolean> {
    const query = this.queries.hardDelete();
    await this._db.execute(query, [id]);

    return true;
  }

  async softDeleteMultiple(ids: string[]): Promise<boolean> {
    const query = this.queries.softDeleteMany();
    await this._db.execute(query, [ids]);

    return true;
  }

  async hardDeleteMultiple(ids: string[]): Promise<boolean> {
    const query = this.queries.hardDeleteMany();
    await this._db.execute(query, [ids]);

    return true;
  }
}
