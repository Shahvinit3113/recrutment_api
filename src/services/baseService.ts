import { IBaseEntities } from "@/entities/base-entities";
import { AppError } from "@/utils/errors/AppError";
import { ErrorCodes } from "@/utils/errors/errorCodes";
import { logger } from "@/utils/logger";
import { TQueries } from "@/database/dbQueries";
import { db } from "@/database/connection";

/**
 * Base service following NestJS pattern with static SQL queries
 */
export abstract class BaseService<Tvm, T extends IBaseEntities, TResult> {
  constructor(
    readonly queriesConfig: TQueries,
    private readonly entityType: new () => T
  ) {}

  //#region Get
  /**
   * Get all records
   */
  async getAll(): Promise<T[]> {
    try {
      const [rows] = await db.execute(this.queriesConfig.getAll());
      return rows as T[];
    } catch (error) {
      logger.error("Error in getAll:", error);
      throw new AppError(
        ErrorCodes.DATABASE_ERROR,
        500,
        "Failed to get all records"
      );
    }
  }

  /**
   * Get by ID
   */
  async getById(id: string): Promise<T> {
    try {
      const [rows] = await db.execute(this.queriesConfig.getById(), [id]);
      const result = (rows as T[])[0];
      if (!result) {
        throw new AppError(ErrorCodes.DATABASE_ERROR, 404, "Record not found");
      }
      return result;
    } catch (error) {
      logger.error("Error in getById:", error);
      throw error;
    }
  }
  //#endregion

  //#region Add
  /**
   * Create new record
   */
  async create(entity: Tvm): Promise<TResult> {
    try {
      await this.validateAdd(entity);

      const model = this.toEntity(entity);

      await this.preAddOperation(entity, model);

      const query = this.queriesConfig.create(model);
      const values = Object.values(model).map((value) =>
        value === undefined ? null : value
      );

      await db.execute(query, values);

      await this.postAddOperation(entity, model);

      return await this.toEntityResult(model);
    } catch (error) {
      logger.error("Error in create:", error);
      throw error;
    }
  }

  /**
   * Validate add operation
   */
  async validateAdd(entity: Tvm) {}

  /**
   * Pre-add operation
   */
  async preAddOperation(entity: Tvm, model: T) {
    model.CreatedOn = new Date();
    model.UpdatedOn = new Date();
    model.IsActive = true;
    model.IsDeleted = false;
    model.CreatedBy = "system";
    model.UpdatedBy = "system";
  }

  /**
   * Post-add operation
   */
  async postAddOperation(entity: Tvm, model: T) {}

  //#endregion

  //#region Update
  /**
   * Update record
   */
  async update(entity: Tvm, id: string): Promise<TResult> {
    try {
      await this.validateUpdate(entity);

      const model = this.toEntity(entity);

      await this.preUpdateOperation(entity, model);

      const query = this.queriesConfig.update(model);
      const values = Object.values(model);

      await db.execute(query, values);

      await this.postUpdateOperation(entity, model);

      return await this.toEntityResult(model);
    } catch (error) {
      logger.error("Error in update:", error);
      throw error;
    }
  }

  /**
   * Validate update operation
   */
  async validateUpdate(entity: Tvm) {}

  /**
   * Pre-update operation
   */
  async preUpdateOperation(entity: Tvm, model: T) {
    model.UpdatedOn = new Date();
    model.UpdatedBy = "system";
  }

  /**
   * Post-update operation
   */
  async postUpdateOperation(entity: Tvm, model: T) {}

  //#endregion

  //#region Delete
  /**
   * Delete record
   */
  async delete(id: string) {
    try {
      const [result] = await db.execute(this.queriesConfig.delete(), [id]);
      return result;
    } catch (error) {
      logger.error("Error in delete:", error);
      throw new AppError(
        ErrorCodes.DATABASE_ERROR,
        500,
        "Failed to delete record"
      );
    }
  }
  //#endregion

  //#region Functions
  /**
   * Convert view model to entity
   */
  toEntity(vm: Tvm): T {
    const entity = new this.entityType();
    for (const key in vm) {
      if (Object.hasOwnProperty.call(entity, key)) {
        (entity as any)[key] = (vm as any)[key];
      }
    }
    return entity;
  }

  /**
   * Convert entity to result
   */
  async toEntityResult(entity: T): Promise<TResult> {
    return entity as unknown as TResult;
  }
  //#endregion
}
