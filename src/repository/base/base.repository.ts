import { DatabaseConnection } from "@/db/connection/connection";
import { BaseQueries } from "@/db/queries/base/base.query";
import { inject, injectable } from "inversify";
import { TYPES } from "@/core/container/types";
import { IBaseEntities } from "@/data/entities/base-entities";

/**
 * Base repository implementation providing common CRUD operations
 * @template T - Entity type that extends IBaseEntity
 */
@injectable()
export class BaseRepository<T extends IBaseEntities> extends BaseQueries<T> {
  protected readonly _db: DatabaseConnection;

  constructor(
    @inject(TYPES.DatabaseConnection) db: DatabaseConnection,
    table: string
  ) {
    super(table);
    this._db = db;
  }

  async getAll(params: any[], columns?: (keyof T)[]): Promise<T[]> {
    const [rows] = await this._db.execute(this.seletAllQuery(columns), params);
    return rows as T[];
  }

  async getById(
    id: string,
    params: any[],
    columns?: (keyof T)[]
  ): Promise<T | null> {
    const [rows] = await this._db.execute(this.selectByIdQuery(columns), [
      id,
      ...params,
    ]);
    const result = (rows as T[])[0];
    return result || null;
  }

  async create(entity: T): Promise<T> {
    const query = this.insertQuery(entity);
    const values = Object.values(entity).map((value) =>
      value === undefined ? null : value
    );
    await this._db.execute(query, values);
    return entity;
  }

  async update(entity: T, id: string): Promise<T> {
    const query = this.putQuery(entity);
    const values = [...Object.values(entity).slice(1), id];
    await this._db.execute(query, values);
    return entity;
  }

  async softDelete(id: string): Promise<boolean> {
    const query = this.softDeleteQuery();
    await this._db.execute(query, [id]);

    return true;
  }

  async hardDelete(id: string): Promise<boolean> {
    const query = this.hardDeleteQuery();
    await this._db.execute(query, [id]);

    return true;
  }

  async softDeleteMultiple(ids: string[]): Promise<boolean> {
    const query = this.softDeleteManyQuery();
    await this._db.execute(query, [ids]);

    return true;
  }

  async hardDeleteMultiple(ids: string[]): Promise<boolean> {
    const query = this.hardDeleteManyQuery();
    await this._db.execute(query, [ids]);

    return true;
  }
}
