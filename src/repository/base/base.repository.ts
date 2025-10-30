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

  /**
   * Retrieves all active records for a given organization
   * @param params Array of parameters including organization ID
   * @param columns Optional array of column names to select
   * @returns Promise resolving to array of entities
   */
  async getAll(params: any[], columns?: (keyof T)[]): Promise<T[]> {
    const [rows] = await this._db.execute(this.seletAllQuery(columns), params);
    return rows as T[];
  }

  /**
   * Retrieves a single record by its unique identifier
   * @param id Unique identifier of the record
   * @param params Array of parameters including organization ID
   * @param columns Optional array of column names to select
   * @returns Promise resolving to entity or null if not found
   */
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

  /**
   * Creates a new record in the database
   * @param entity Entity to create
   * @returns Promise resolving to created entity
   */
  async create(entity: T): Promise<T> {
    const query = this.insertQuery(entity);
    const values = Object.values(entity).map((value) =>
      value === undefined ? null : value
    );
    await this._db.execute(query, values);
    return entity;
  }

  /**
   * Updates an existing record in the database
   * @param entity Updated entity data
   * @param id Unique identifier of the record to update
   * @returns Promise resolving to updated entity
   */
  async update(entity: T, id: string): Promise<T> {
    const query = this.putQuery(entity);
    const values = [...Object.values(entity).slice(1), id];
    await this._db.execute(query, values);
    return entity;
  }

  /**
   * Marks a record as deleted without removing it from the database
   * @param id Unique identifier of the record to delete
   * @returns Promise resolving to boolean indicating success
   */
  async softDelete(id: string): Promise<boolean> {
    const query = this.softDeleteQuery();
    await this._db.execute(query, [id]);

    return true;
  }

  /**
   * Permanently removes a record from the database
   * @param id Unique identifier of the record to delete
   * @returns Promise resolving to boolean indicating success
   */
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
