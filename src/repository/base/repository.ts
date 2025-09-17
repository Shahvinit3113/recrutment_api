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
export class Respository<T extends IBaseEntities> {
  constructor(
    @inject(TYPES.DatabaseConnection) protected readonly db: DatabaseConnection,
    protected readonly queries: BaseQueries<T>
  ) {}

  async getAll(columns?: [keyof T]): Promise<T[]> {
    const [rows] = await this.db.execute(this.queries.getAll(columns));
    return rows as T[];
  }

  async getById(id: string, columns?: [keyof T]): Promise<T | null> {
    const [rows] = await this.db.execute(this.queries.getById(columns), [id]);
    const result = (rows as T[])[0];
    return result || null;
  }

  async create(entity: T): Promise<T> {
    const query = this.queries.create(entity);
    const values = Object.values(entity).map((value) =>
      value === undefined ? null : value
    );
    await this.db.execute(query, values);
    return entity;
  }

  async update(entity: T, id: string): Promise<T> {
    const query = this.queries.update(entity);
    const values = [...Object.values(entity).slice(1), id];
    await this.db.execute(query, values);
    return entity;
  }

  async softDelete(id: string): Promise<boolean> {
    const query = this.queries.softDelete();
    await this.db.execute(query, [id]);

    return true;
  }

  async hardDelete(id: string): Promise<boolean> {
    const query = this.queries.hardDelete();
    await this.db.execute(query, [id]);

    return true;
  }

  async softDeleteMultiple(ids: string[]): Promise<boolean> {
    const query = this.queries.softDeleteMany();
    await this.db.execute(query, [ids]);

    return true;
  }

  async hardDeleteMultiple(ids: string[]): Promise<boolean> {
    const query = this.queries.hardDeleteMany();
    await this.db.execute(query, [ids]);

    return true;
  }
}
