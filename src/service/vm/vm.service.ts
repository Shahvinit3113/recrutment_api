import { BaseEntities } from "@/data/entities/base-entities";
import { Filter, PaginationParams, parsePagination } from "@/data/filters/filter";
import { CallerService } from "../caller/caller.service";
import { BaseRepository } from "@/repository/base/base.repository";
import { 
  Result, 
  SingleResult, 
  PagedListResult 
} from "@/data/response/response";
import { Utility } from "@/core/utils/common.utils";
import { ValidationError } from "@/middleware/errors/validation.error";
import { UnitOfWork } from "@/db/connection/unit-of-work";

/**
 * Enhanced service class that works with view models and provides
 * comprehensive CRUD operations with validation, lifecycle hooks, 
 * transaction support, and proper typed responses.
 *
 * @template TVm - View Model type
 * @template T - Entity type that extends BaseEntities
 * @template F - Filter criteria type
 */
export abstract class VmService<
  TVm,
  T extends BaseEntities,
  F extends Filter
> {
  protected _repository: BaseRepository<T>;
  protected readonly _callerService: CallerService;
  protected readonly entityType: new () => T;
  private readonly _parentRepository?: any; // Repository instance with UnitOfWork

  /**
   * Gets the UnitOfWork from the parent repository for transaction management
   */
  protected get _unitOfWork(): UnitOfWork | undefined {
    return this._parentRepository?.UnitOfWork;
  }

  /**
   * Initializes a new instance of the VmService
   * @param repository Base repository instance for database operations
   * @param callerService Service containing context information about the current caller
   * @param entityType Constructor function for creating new instances of the entity
   * @param parentRepository Optional parent Repository instance for accessing UnitOfWork
   */
  constructor(
    repository: BaseRepository<T>,
    callerService: CallerService,
    entityType: new () => T,
    parentRepository?: any
  ) {
    this._repository = repository;
    this._callerService = callerService;
    this.entityType = entityType;
    this._parentRepository = parentRepository;
  }

  //#region Get Operations
  /**
   * Retrieves all records for the current organization with pagination
   * @param pagination Pagination parameters
   * @param columns Optional array of specific columns to retrieve
   * @returns Promise resolving to a paged list result
   */
  async getAllAsync(
    pagination?: PaginationParams,
    columns?: (keyof T)[]
  ): Promise<PagedListResult<T>> {
    const paginationParams = pagination || parsePagination({});
    
    const result = await this._repository.getAllPaginated(
      this._callerService.tenantId,
      paginationParams,
      columns
    );

    return PagedListResult.of(
      result.data,
      result.page,
      result.limit,
      result.total
    );
  }

  /**
   * Retrieves a specific record by its unique identifier
   * @param id The unique identifier of the record to retrieve
   * @param columns Optional array of specific columns to retrieve
   * @returns Promise resolving to a single result
   * @throws Error if the record is not found
   */
  async getByIdAsync(
    id: string,
    columns?: (keyof T)[]
  ): Promise<SingleResult<T>> {
    const entity = await this._repository.getById(
      id,
      [this._callerService.tenantId],
      columns
    );
    
    if (entity == null) {
      throw new Error(`${this.entityType.name} not found`);
    }

    return SingleResult.of(await this.transformEntity(entity));
  }
  //#endregion

  //#region Add Operations
  /**
   * Creates a new record in the system with transaction support
   * @param model The view model containing the data for the new record
   * @returns Promise resolving to the newly created record
   */
  async createAsync(model: TVm): Promise<SingleResult<T>> {
    // Validate first
    await this.validateAdd(model);

    // Use transaction if available
    if (this._unitOfWork) {
      return this._unitOfWork.withTransaction(async () => {
        return this.performCreate(model);
      });
    }

    return this.performCreate(model);
  }

  /**
   * Internal method to perform the actual create operation
   */
  private async performCreate(model: TVm): Promise<SingleResult<T>> {
    let entity = this.toEntity(model);

    await this.preAddOperation(model, entity);

    entity = await this._repository.create(entity);

    await this.postAddOperation(model, entity);

    return SingleResult.of(await this.transformEntity(entity));
  }

  /**
   * Validates the model before creating a new record
   * @param entity The view model to validate
   * @throws Error if validation fails
   */
  async validateAdd(entity: TVm): Promise<void> {}

  /**
   * Performs operations on the entity before it is created
   * @param model The original view model
   * @param entity The entity being created
   */
  async preAddOperation(model: TVm, entity: T): Promise<void> {
    entity.Uid = Utility.generateUUID();
    entity.OrgId = this._callerService.tenantId;
    entity.CreatedOn = new Date();
    entity.IsActive = true;
    entity.IsDeleted = false;
    entity.CreatedBy = this._callerService.userId;
  }

  /**
   * Performs operations after an entity has been created
   * @param model The original view model
   * @param entity The newly created entity
   */
  async postAddOperation(model: TVm, entity: T): Promise<void> {}
  //#endregion

  //#region Update Operations
  /**
   * Updates an existing record in the system with transaction support
   * @param model The view model containing the updated data
   * @param id The unique identifier of the record to update
   * @returns Promise resolving to the updated record
   * @throws Error if the record is not found or validation fails
   */
  async updateAsync(model: TVm, id: string): Promise<SingleResult<T>> {
    // Validate first
    await this.validateUpdate(model);

    // Use transaction if available
    if (this._unitOfWork) {
      return this._unitOfWork.withTransaction(async () => {
        return this.performUpdate(model, id);
      });
    }

    return this.performUpdate(model, id);
  }

  /**
   * Internal method to perform the actual update operation
   */
  private async performUpdate(model: TVm, id: string): Promise<SingleResult<T>> {
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

    return SingleResult.of(await this.transformEntity(entity));
  }

  /**
   * Validates the model before updating a record
   * @param entity The view model to validate
   * @throws Error if validation fails
   */
  async validateUpdate(entity: TVm): Promise<void> {}

  /**
   * Performs operations on the entity before it is updated
   * @param model The view model containing updated data
   * @param entity The existing entity being updated
   */
  async preUpdateOperation(model: TVm, entity: T): Promise<void> {
    entity.UpdatedOn = new Date();
    entity.UpdatedBy = this._callerService.userId;

    if (entity.OrgId != this._callerService.tenantId) {
      throw new ValidationError("Not authorized");
    }
  }

  /**
   * Performs operations after an entity has been updated
   * @param model The view model used for update
   * @param entity The updated entity
   */
  async postUpdateOperation(model: TVm, entity: T): Promise<void> {}
  //#endregion

  //#region Delete Operations
  /**
   * Performs a soft delete on a record
   * @param id The unique identifier of the record to delete
   * @returns Promise resolving to boolean indicating success
   */
  async deleteAsync(id: string): Promise<boolean> {
    return await this._repository.softDelete(id);
  }
  //#endregion

  //#region Helper Functions
  /**
   * Convert view model to entity
   */
  toEntity(vm: TVm): T {
    const entity = new this.entityType();

    for (const key in vm) {
      if (key in entity) {
        (entity as any)[key] = (vm as any)[key];
      }
    }

    return entity;
  }

  /**
   * Merges view model properties into the existing entity
   * @param model The view model with updated values
   * @param entity The existing entity to update
   */
  protected mergeModelToEntity(model: TVm, entity: T): void {
    const entityPrototype = new this.entityType();
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

    // Remove any properties from entity that don't belong to the entity type
    for (const key in entity) {
      if (!(key in entityPrototype)) {
        delete (entity as any)[key];
      }
    }

    // Merge the model properties into entity
    for (const key in model) {
      if (!excludedFields.includes(key) && key in entityPrototype) {
        (entity as any)[key] = (model as any)[key];
      }
    }
  }

  /**
   * Transform entity for response (can be overridden for custom transformations)
   * @param entity The entity to transform
   * @returns Transformed entity
   */
  protected async transformEntity(entity: T): Promise<T> {
    return entity;
  }
  //#endregion

  //#region Legacy Support (Deprecated)
  /**
   * @deprecated Use toTransformedEntity instead
   * Kept for backward compatibility
   */
  async toEntityResult(entity: T): Promise<any> {
    return entity;
  }
  //#endregion
}
