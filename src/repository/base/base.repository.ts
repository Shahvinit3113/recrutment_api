import { DatabaseConnection } from "@/db/connection/connection";
import { BaseQueries } from "@/db/queries/base/base.query";
import { inject, injectable } from "inversify";
import { TYPES } from "@/core/container/types";
import { BaseEntities } from "@/data/entities/base-entities";
import { Filter } from "@/data/filters/filter";

/**
 * Base repository implementation providing common CRUD operations
 * @template T - Entity type that extends IBaseEntity
 */
@injectable()
export class BaseRepository<T extends BaseEntities> extends BaseQueries<T> {
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
  async getAll(
    params: any[],
    columns?: (keyof T)[],
    filter?: Filter
  ): Promise<T[]> {
    const [rows] = await this._db.execute(
      this.seletAllQuery(columns, filter),
      params
    );
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
   * Gets the total count of records for pagination
   * @param params Array of parameters including organization ID
   * @returns Promise resolving to count result
   */
  async count(params: any[]): Promise<{ TotalRecords: number }[]> {
    const [rows] = await this._db.execute(this.countQuery(), params);
    return rows as { TotalRecords: number }[];
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
   * Creates multiple records in the database using a single query
   * @param entities Array of entities to create
   * @returns Promise resolving to array of created entities
   */
  async createMany(entities: T[]): Promise<T[]> {
    if (!entities.length) {
      return [];
    }

    const query = this.insertManyQuery(entities);
    const values = entities.flatMap((entity) =>
      Object.values(entity).map((value) => (value === undefined ? null : value))
    );

    await this._db.execute(query, values);
    return entities;
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
   * Updates multiple records in the database using a single query
   * @param entities Array of entities with updated values (must include Uid)
   * @param excludeFields Optional array of field names to exclude from update (Uid is always excluded)
   * @returns Promise resolving to array of updated entities
   */
  async updateMany(entities: T[], excludeFields?: (keyof T)[]): Promise<T[]> {
    if (!entities.length) {
      return [];
    }

    // Get all fields from first entity, excluding Uid and specified fields
    const allFields = Object.keys(entities[0]) as (keyof T)[];
    const fieldsToExclude = Array.from(
      new Set([...(excludeFields || []), "Uid" as keyof T])
    );

    const updateFields = allFields.filter(
      (field) => !fieldsToExclude.includes(field)
    );

    const query = this.updateManyQuery(entities, fieldsToExclude);

    const caseValues: any[] = [];
    updateFields.forEach((field) => {
      entities.forEach((entity) => {
        caseValues.push(entity.Uid);
        caseValues.push(entity[field] === undefined ? null : entity[field]);
      });
    });

    const uids = entities.map((e) => e.Uid);
    const values = [...caseValues, ...uids];

    await this._db.execute(query, values);
    return entities;
  }

  /**
   * Upserts multiple records in a single query (bulk operation)
   * Requires a UNIQUE constraint on the key field (default: Uid)
   * @param entities Array of entities to upsert
   * @param uniqueKey The unique constraint column (defaults to 'Uid')
   * @param excludeFromUpdate Optional fields to exclude from update
   * @returns Promise resolving to array of upserted entities
   */
  async upsertMany(
    entities: T[],
    uniqueKey: keyof T = "Uid" as keyof T,
    excludeFromUpdate?: (keyof T)[]
  ): Promise<T[]> {
    if (!entities.length) {
      return [];
    }

    const query = this.upsertManyQuery(entities, uniqueKey, excludeFromUpdate);

    // Flatten all entity values in the same order as keys
    const values = entities.flatMap((entity) =>
      Object.keys(entity)
        .filter((k) => entity[k as keyof T] !== undefined)
        .map((k) => {
          const value = entity[k as keyof T];
          return value === undefined ? null : value;
        })
    );

    await this._db.execute(query, values);
    return entities;
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
