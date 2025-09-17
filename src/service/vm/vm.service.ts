import { IBaseEntities } from "@/data/entities/base-entities";
import { Respository } from "@/repository/implementation/repository";
import { Filter } from "@/data/filters/filter";
import { CallerService } from "../caller/caller.service";

/**
 * Enhanced service class that works with view models and provides
 * comprehensive CRUD operations with validation and lifecycle hooks
 *
 * @template TVm - View Model type
 * @template T - Entity type that extends IBaseEntity
 * @template Filter - Filter criteria type
 * @template TResult - Result type for operations
 */
export class VmService<
  TVm,
  T extends IBaseEntities,
  F extends Filter,
  TResult
> {
  private readonly _repository: Respository<T>;
  private readonly _callerService: CallerService;
  private readonly entityType: new () => T;

  constructor(
    repositry: Respository<T>,
    callerService: CallerService,
    entityType: new () => T
  ) {
    this._repository = repositry;
    this._callerService = callerService;
    this.entityType = entityType;
  }

  //#region Get
  /**
   * Get all records
   */
  async getAllAsync(columns?: [keyof T]): Promise<TResult> {
    return (await this._repository.getAll(columns)) as TResult;
  }

  /**
   * Get by ID
   */
  async getByIdAsync(id: string, columns?: [keyof T]): Promise<TResult> {
    const entity = await this._repository.getById(id, columns);
    if (entity == null) {
      throw new Error(`${this.entityType.name} not found`);
    }

    return this.toEntityResult(entity);
  }
  //#endregion

  //#region Add
  /**
   * Create new record
   */
  async createAsync(model: TVm): Promise<TResult> {
    await this.validateAdd(model);

    let entity = this.toEntity(model);

    await this.preAddOperation(model, entity);

    entity = await this._repository.create(entity);

    await this.postAddOperation(model, entity);

    return await this.toEntityResult(entity);
  }

  /**
   * Validate add operation
   */
  async validateAdd(entity: TVm) {}

  /**
   * Pre-add operation
   */
  async preAddOperation(model: TVm, entity: T) {
    entity.CreatedOn = new Date();
    entity.IsActive = true;
    entity.IsDeleted = false;
    entity.CreatedBy = this._callerService.UserId;
  }

  /**
   * Post-add operation
   */
  async postAddOperation(entity: TVm, model: T) {}

  //#endregion

  //#region Update
  /**
   * Update record
   */
  async updateAsync(model: TVm, id: string): Promise<TResult> {
    await this.validateUpdate(model);

    let entity = await this._repository.getById(id);

    if (entity == null) {
      throw new Error(`${this.entityType.name} not found`);
    }

    await this.preUpdateOperation(model, entity);

    entity = await this._repository.update(entity, id);

    await this.postUpdateOperation(model, entity);

    return await this.toEntityResult(entity);
  }

  /**
   * Validate update operation
   */
  async validateUpdate(entity: TVm) {}

  /**
   * Pre-update operation
   */
  async preUpdateOperation(model: TVm, entity: T) {
    entity.UpdatedOn = new Date();
    entity.UpdatedBy = this._callerService.UserId;
  }

  /**
   * Post-update operation
   */
  async postUpdateOperation(entity: TVm, model: T) {}

  //#endregion

  //#region Delete
  /**
   * Delete record
   */
  async deleteAsync(id: string) {
    return await this._repository.softDelete(id);
  }
  //#endregion

  //#region Functions
  /**
   * Convert view model to entity
   */
  toEntity(vm: TVm): T {
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
