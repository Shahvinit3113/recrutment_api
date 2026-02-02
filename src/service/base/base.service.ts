import { injectable } from 'inversify';
import { BaseEntities } from '@/data/entities/base-entities';
import { TableName } from '@/database/tables';
import { IRepository, IUnitOfWork } from '@/repository';
import { ListQueryOptions, PaginatedResult } from '@/database/types';
import { CallerService } from '@/service/caller/caller.service';
import { Result } from '@/data/response/response';
import { Utility } from '@/core/utils/common.utils';
import { ValidationError } from '@/middleware/errors/validation.error';

/**
 * Base Service Class (Knex.js version)
 * 
 * Replaces VmService with Knex.js-based implementation.
 * Provides common CRUD operations with:
 * - View model transformation
 * - Validation hooks (validateAdd, validateUpdate)
 * - Pre/Post operation hooks
 * - CallerService integration for tenant/user context
 * - Transaction support via Unit of Work
 * 
 * @template T - Entity type extending BaseEntities
 * @template TVm - View Model type (defaults to T)
 * 
 * @example
 * ```typescript
 * @injectable()
 * class UserService extends BaseService<User> {
 *   constructor(
 *     @inject(TYPES.UnitOfWork) unitOfWork: IUnitOfWork,
 *     @inject(TYPES.Caller) callerService: CallerService
 *   ) {
 *     super(unitOfWork, callerService, TableNames.User, User);
 *   }
 * 
 *   // Override validation
 *   async validateAdd(entity: User): Promise<void> {
 *     const existing = await this.repository.findOneWhere({ Email: entity.Email });
 *     if (existing) throw new ValidationError('Email already exists');
 *   }
 * }
 * ```
 */
@injectable()
export abstract class BaseService<T extends BaseEntities, TVm = T> {
  protected readonly unitOfWork: IUnitOfWork;
  protected readonly repository: IRepository<T>;
  protected readonly tableName: TableName;
  protected readonly _callerService: CallerService;
  protected readonly entityType: new () => T;

  /**
   * Create a new service instance
   * @param unitOfWork - Unit of Work for repository access
   * @param callerService - Caller context service
   * @param tableName - Database table name for this entity
   * @param entityType - Constructor for entity type
   */
  constructor(
    unitOfWork: IUnitOfWork,
    callerService: CallerService,
    tableName: TableName,
    entityType: new () => T
  ) {
    this.unitOfWork = unitOfWork;
    this._callerService = callerService;
    this.tableName = tableName;
    this.entityType = entityType;
    this.repository = unitOfWork.getRepository<T>(tableName);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // READ OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get all active records for the current organization
   */
  async getAllAsync(columns?: (keyof T)[]): Promise<Result<T>> {
    const data = await this.repository.findAll(
      this._callerService.tenantId,
      columns
    );
    return Result.toPagedResult(1, 1, 1, data) as Result<T>;
  }

  /**
   * Get paginated list with filtering and sorting
   */
  async getListAsync(
    options?: ListQueryOptions
  ): Promise<PaginatedResult<T>> {
    return await this.repository.findList(
      this._callerService.tenantId,
      options
    );
  }

  /**
   * Get a single record by ID
   */
  async getByIdAsync(id: string, columns?: (keyof T)[]): Promise<Result<T>> {
    const entity = await this.repository.findById(
      id,
      this._callerService.tenantId,
      columns
    );
    
    if (entity == null) {
      throw new Error(`${this.entityType.name} not found`);
    }

    return this.toEntityResult(entity);
  }

  /**
   * Check if an entity exists
   */
  async exists(id: string): Promise<boolean> {
    return await this.repository.exists(id, this._callerService.tenantId);
  }

  /**
   * Count records for current organization
   */
  async count(): Promise<number> {
    return await this.repository.count(this._callerService.tenantId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Create a new record
   */
  async createAsync(model: TVm): Promise<Result<T>> {
    await this.validateAdd(model);

    let entity = this.toEntity(model);

    await this.preAddOperation(model, entity);

    entity = await this.repository.create(entity);

    await this.postAddOperation(model, entity);

    return await this.toEntityResult(entity);
  }

  /**
   * Validates the model before creating
   * Override in derived classes for custom validation
   */
  async validateAdd(entity: TVm): Promise<void> {}

  /**
   * Operations before entity creation
   * Sets default values for new entities
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
   * Operations after entity creation
   * Override for post-create logic (e.g., notifications)
   */
  async postAddOperation(model: TVm, entity: T): Promise<void> {}

  // ═══════════════════════════════════════════════════════════════════════════
  // UPDATE OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Update an existing record
   */
  async updateAsync(model: TVm, id: string): Promise<Result<T>> {
    await this.validateUpdate(model);

    let entity = await this.repository.findById(
      id,
      this._callerService.tenantId
    );

    if (entity == null) {
      throw new Error(`${this.entityType.name} not found`);
    }

    this.mergeModelToEntity(model, entity);

    await this.preUpdateOperation(model, entity);

    entity = await this.repository.update(id, entity);

    await this.postUpdateOperation(model, entity);

    return await this.toEntityResult(entity);
  }

  /**
   * Validates the model before updating
   * Override in derived classes for custom validation
   */
  async validateUpdate(entity: TVm): Promise<void> {}

  /**
   * Operations before entity update
   * Sets update metadata and validates tenant access
   */
  async preUpdateOperation(model: TVm, entity: T): Promise<void> {
    entity.UpdatedOn = new Date();
    entity.UpdatedBy = this._callerService.userId;

    if (entity.OrgId != this._callerService.tenantId) {
      throw new ValidationError('Not authorized');
    }
  }

  /**
   * Operations after entity update
   * Override for post-update logic
   */
  async postUpdateOperation(model: TVm, entity: T): Promise<void> {}

  // ═══════════════════════════════════════════════════════════════════════════
  // DELETE OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Soft delete a record
   */
  async deleteAsync(id: string): Promise<boolean> {
    return await this.repository.softDelete(id);
  }

  /**
   * Hard delete a record (use with caution)
   */
  async hardDeleteAsync(id: string): Promise<boolean> {
    return await this.repository.hardDelete(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TRANSFORMATION METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Convert view model to entity
   */
  toEntity(vm: TVm): T {
    const entity = new this.entityType();

    for (const key in vm) {
      if (key in entity) {
        (entity as Record<string, unknown>)[key] = (vm as Record<string, unknown>)[key];
      }
    }

    return entity;
  }

  /**
   * Merge view model properties into existing entity
   */
  protected mergeModelToEntity(model: TVm, entity: T): void {
    const entityPrototype = new this.entityType();
    const excludedFields = [
      'Uid',
      'OrgId',
      'CreatedOn',
      'CreatedBy',
      'UpdatedOn',
      'UpdatedBy',
      'DeletedOn',
      'DeletedBy',
      'IsDeleted',
    ];

    // Remove extra properties from joins
    for (const key in entity) {
      if (!(key in entityPrototype)) {
        delete (entity as Record<string, unknown>)[key];
      }
    }

    // Merge model properties
    for (const key in model) {
      if (!excludedFields.includes(key) && key in entityPrototype) {
        (entity as Record<string, unknown>)[key] = (model as Record<string, unknown>)[key];
      }
    }
  }

  /**
   * Convert entity to result
   */
  async toEntityResult(entity: T): Promise<Result<T>> {
    return entity as unknown as Result<T>;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPER METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get repository for another table (for cross-table operations)
   */
  protected getOtherRepository<TEntity extends BaseEntities>(
    tableName: TableName
  ): IRepository<TEntity> {
    return this.unitOfWork.getRepository<TEntity>(tableName);
  }

  /**
   * Execute operations in a transaction
   */
  protected async transaction<TResult>(
    callback: (trx: import('knex').Knex.Transaction) => Promise<TResult>
  ): Promise<TResult> {
    return await this.unitOfWork.transaction(callback);
  }

  /**
   * Get current tenant ID
   */
  protected get tenantId(): string {
    return this._callerService.tenantId;
  }

  /**
   * Get current user ID
   */
  protected get userId(): string {
    return this._callerService.userId;
  }
}
