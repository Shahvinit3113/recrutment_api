import { BaseEntities } from "@/data/entities/base-entities";
import { Filter } from "@/data/filters/filter";
import { CallerService } from "../caller/caller.service";
import { BaseRepository } from "@/repository/base/base.repository";
import { Result } from "@/data/response/response";
import { Utility } from "@/core/utils/common.utils";
import { ValidationError } from "@/middleware/errors/validation.error";

/**
 * Enhanced service class that works with view models and provides
 * comprehensive CRUD operations with validation and lifecycle hooks
 *
 * @template TVm - View Model type
 * @template T - Entity type that extends IBaseEntity
 * @template Filter - Filter criteria type
 * @template TResult - Result type for operations
 */
export abstract class VmService<
  TVm,
  T extends BaseEntities,
  F extends Filter,
  TResult
> {
  protected _repository: BaseRepository<T>;
  protected readonly _callerService: CallerService;
  protected readonly entityType: new () => T;

  /**
   * Initializes a new instance of the VmService
   * @param repositry Base repository instance for database operations
   * @param callerService Service containing context information about the current caller
   * @param entityType Constructor function for creating new instances of the entity
   */
  constructor(
    repositry: BaseRepository<T>,
    callerService: CallerService,
    entityType: new () => T
  ) {
    this._repository = repositry;
    this._callerService = callerService;
    this.entityType = entityType;
  }

  //#region Get
  /**
   * Retrieves all records for the current organization
   * @param columns Optional array of specific columns to retrieve
   * @returns Promise resolving to a paged result containing all matching records
   * @remarks This method automatically filters by the current tenant ID and
   * transforms the database entities into the appropriate result type
   */
  async getAllAsync(columns?: (keyof T)[]): Promise<TResult> {
    return Result.toPagedResult(
      1,
      1,
      1,
      await this._repository.getAll([this._callerService.tenantId], columns)
    ) as TResult;
  }

  /**
   * Retrieves a specific record by its unique identifier
   * @param id The unique identifier of the record to retrieve
   * @param columns Optional array of specific columns to retrieve
   * @returns Promise resolving to the requested record
   * @throws Error if the record is not found or doesn't belong to the current organization
   * @remarks This method validates tenant access and transforms the database entity
   * into the appropriate result type
   */
  async getByIdAsync(id: string, columns?: (keyof T)[]): Promise<TResult> {
    const entity = await this._repository.getById(
      id,
      [this._callerService.tenantId],
      columns
    );
    if (entity == null) {
      throw new Error(`${this.entityType.name} not found`);
    }

    return this.toEntityResult(entity);
  }
  //#endregion

  //#region Add
  /**
   * Creates a new record in the system
   * @param model The view model containing the data for the new record
   * @returns Promise resolving to the newly created record
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
   * Validates the model before creating a new record
   * @param entity The view model to validate
   * @throws Error if validation fails
   * @remarks Override this method in derived classes to implement
   * specific validation rules for entity creation
   */
  async validateAdd(entity: TVm) {}

  /**
   * Performs operations on the entity before it is created
   * @param model The original view model
   * @param entity The entity being created
   * Override in derived classes to add custom pre-creation logic
   */
  async preAddOperation(model: TVm, entity: T) {
    entity.Uid = Utility.generateUUID();
    entity.OrgId = this._callerService.tenantId;
    entity.CreatedOn = new Date();
    entity.IsActive = true;
    entity.IsDeleted = false;
    entity.CreatedBy = this._callerService.userId;
  }

  /**
   * Performs operations after an entity has been created
   * @param entity The original view model
   * @param model The newly created entity
   * @remarks Override this method in derived classes to implement
   * additional operations that need to be performed after entity creation,
   * such as creating related records or triggering events
   */
  async postAddOperation(entity: TVm, model: T) {}

  //#endregion

  //#region Update
  /**
   * Updates an existing record in the system
   * @param model The view model containing the updated data
   * @param id The unique identifier of the record to update
   * @returns Promise resolving to the updated record
   * @throws Error if the record is not found or validation fails
   */
  async updateAsync(model: TVm, id: string): Promise<TResult> {
    await this.validateUpdate(model);

    let entity = await this._repository.getById(id, [
      this._callerService.tenantId,
    ]);

    if (entity == null) {
      throw new Error(`${this.entityType.name} not found`);
    }

    this.mergeModelToEntity(model, entity);

    await this.preUpdateOperation(model, entity);

    entity = await this._repository.update(entity, id);

    await this.postUpdateOperation(model, entity);

    return await this.toEntityResult(entity);
  }

  /**
   * Validates the model before updating a record
   * @param entity The view model to validate
   * @throws Error if validation fails
   * @remarks Override this method in derived classes to implement
   * specific validation rules for entity updates, such as
   * checking for concurrent modifications or business rule violations
   */
  async validateUpdate(entity: TVm) {}

  /**
   * Performs operations on the entity before it is updated
   * @param model The view model containing updated data
   * @param entity The existing entity being updated
   * Override in derived classes to implement custom pre-update logic
   * such as handling related entities or maintaining audit trails
   */
  async preUpdateOperation(model: TVm, entity: T) {
    entity.UpdatedOn = new Date();
    entity.UpdatedBy = this._callerService.userId;

    if (entity.OrgId != this._callerService.tenantId) {
      throw new ValidationError("Not authorized");
    }
  }

  /**
   * Performs operations after an entity has been updated
   * @param entity The view model used for update
   * @param model The updated entity
   * @remarks Override this method in derived classes to implement
   * additional operations after update, such as updating related records,
   * triggering notifications, or maintaining cache consistency
   */
  async postUpdateOperation(entity: TVm, model: T) {}

  //#endregion

  //#region Delete
  /**
   * Performs a soft delete on a record
   * @param id The unique identifier of the record to delete
   * @returns Promise resolving to boolean indicating success
   * @remarks This method performs a soft delete by marking the record
   * as deleted rather than removing it from the database. This maintains
   * referential integrity and allows for potential recovery
   */
  async deleteAsync(id: string): Promise<boolean> {
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
      (entity as any)[key] = (vm as any)[key];
    }
    return entity;
  }

  /**
   * Merges view model properties into the existing entity
   * @param model The view model with updated values
   * @param entity The existing entity to update
   * @remarks Copies all properties from the model to the entity,
   * excluding metadata fields that are managed by the system
   */
  protected mergeModelToEntity(model: TVm, entity: T): void {
    const excludedFields = [
      "Uid",
      "OrgId",
      "CreatedOn",
      "CreatedBy",
      "UpdatedOn",
      "UpdatedBy",
      "DeletedOn",
      "DeletedBy",
      "IsDeleted",
    ];

    for (const key in model) {
      // Skip system-managed fields
      if (!excludedFields.includes(key)) {
        (entity as any)[key] = (model as any)[key];
      }
    }
  }

  /**
   * Convert entity to result
   */
  async toEntityResult(entity: T): Promise<TResult> {
    return entity as unknown as TResult;
  }
  //#endregion
}
