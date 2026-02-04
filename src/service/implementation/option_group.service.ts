import { inject, injectable } from 'inversify';
import { TYPES } from '@/core/container/types';
import { OptionGroup } from '@/data/entities/option_group';
import { TableNames } from '@/database/tables';
import { IUnitOfWork } from '@/repository';
import { CallerService } from '../caller/caller.service';
import { BaseService } from '../base/base.service';
import { ListQueryOptions, PaginatedResult } from '@/database/types';
import { OptionGroupResult } from '@/data/results/option_group_result';
import { Result } from '@/data/response/response';
import { OptionGroupVm, OptionVm } from '@/data/models/OptionGroupVm';
import { ValidationError } from '@/middleware/errors/validation.error';
import { Utility } from '@/core/utils/common.utils';

@injectable()
export class OptionGroupService extends BaseService<OptionGroup, OptionGroupVm> {
  constructor(
    @inject(TYPES.UnitOfWork) unitOfWork: IUnitOfWork,
    @inject(TYPES.Caller) callerService: CallerService
  ) {
    super(unitOfWork, callerService, TableNames.OptionGroup, OptionGroup);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Validate before creating OptionGroup
   * Checks for duplicate option names within the provided Options array
   */
  override async validateAdd(model: OptionGroupVm): Promise<void> {
    await this.validateNoDuplicateOptionNames(model.Options);
  }

  /**
   * Validate before updating OptionGroup
   * Checks for duplicate option names within the provided Options array
   */
  override async validateUpdate(model: OptionGroupVm): Promise<void> {
    await this.validateNoDuplicateOptionNames(model.Options);
  }

  /**
   * Check if any options have duplicate names
   */
  private async validateNoDuplicateOptionNames(options: OptionVm[]): Promise<void> {
    if (!options?.length) return;

    const names = options.map((o) => o.Name.toLowerCase().trim());
    const uniqueNames = new Set(names);

    if (names.length !== uniqueNames.size) {
      // Find the duplicate names
      const seen = new Set<string>();
      const duplicates: string[] = [];

      for (const name of names) {
        if (seen.has(name)) {
          duplicates.push(name);
        }
        seen.add(name);
      }

      throw new ValidationError(
        `Duplicate option names found: ${[...new Set(duplicates)].join(', ')}`
      );
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // POST OPERATIONS - Upsert Options
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * After creating OptionGroup, upsert all Options using pure SQL
   */
  override async postAddOperation(model: OptionGroupVm, entity: OptionGroup): Promise<void> {
    await this.upsertOptions(model.Options, entity.Uid);
  }

  /**
   * After updating OptionGroup, upsert all Options using pure SQL
   */
  override async postUpdateOperation(model: OptionGroupVm, entity: OptionGroup): Promise<void> {
    await this.upsertOptions(model.Options, entity.Uid);
  }

  /**
   * Upsert options using pure SQL INSERT ... ON DUPLICATE KEY UPDATE
   */
  private async upsertOptions(options: OptionVm[], optionGroupId: string): Promise<void> {
    if (!options?.length) return;

    const now = new Date();
    const emptyGuid = '00000000-0000-0000-0000-000000000000';

    for (const option of options) {
      const uid = option.Uid && option.Uid !== emptyGuid ? option.Uid : Utility.generateUUID();
      const isActive = option.IsActive ?? true;

      // Use INSERT ... ON DUPLICATE KEY UPDATE for upsert
      const query = `
        INSERT INTO ${TableNames.Options} 
          (Uid, OrgId, OptionGroupId, Name, Value, SortOrder, IsActive, IsDeleted, CreatedOn, CreatedBy, UpdatedOn, UpdatedBy)
        VALUES 
          (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          Name = VALUES(Name),
          Value = VALUES(Value),
          SortOrder = VALUES(SortOrder),
          IsActive = VALUES(IsActive),
          UpdatedOn = VALUES(UpdatedOn),
          UpdatedBy = VALUES(UpdatedBy)
      `;

      await this.unitOfWork.raw(query, [
        uid,
        this._callerService.tenantId,
        optionGroupId,
        option.Name,
        option.Value,
        option.SortOrder,
        isActive,
        now,
        this._callerService.userId,
        now,
        this._callerService.userId,
      ]);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // READ OPERATIONS - Override to include nested Options
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get all option groups with nested options
   * Returns all option groups with their options in a single query using JSON_ARRAYAGG
   */
  override async getAllAsync(): Promise<Result<OptionGroupResult>> {
    const query = `
      SELECT 
        og.Uid,
        og.OrgId,
        og.Name,
        og.Description,
        og.IsActive,
        og.CreatedOn,
        og.CreatedBy,
        og.UpdatedOn,
        og.UpdatedBy,
        (
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
              'Uid', opt.Uid,
              'OrgId', opt.OrgId,
              'OptionGroupId', opt.OptionGroupId,
              'Name', opt.Name,
              'Value', opt.Value,
              'SortOrder', opt.SortOrder
            )
          )
          FROM ${TableNames.Options} opt
          WHERE opt.OptionGroupId = og.Uid AND opt.IsDeleted = 0
          ORDER BY opt.SortOrder
        ) AS Options
      FROM ${TableNames.OptionGroup} og
      WHERE og.OrgId = ? AND og.IsDeleted = 0
      ORDER BY og.CreatedOn DESC
    `;

    const results = await this.unitOfWork.raw<OptionGroupResult[]>(query, [
      this._callerService.tenantId,
    ]);

    return Result.toPagedResult(1, 1, results.length, results) as Result<OptionGroupResult>;
  }

  /**
   * Get paginated list of option groups with nested options
   * Returns option groups with their options in a single query using JSON_ARRAYAGG
   */
  override async getListAsync(
    options?: ListQueryOptions
  ): Promise<PaginatedResult<OptionGroupResult>> {
    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 10;
    const offset = (page - 1) * pageSize;

    // Count query for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM ${TableNames.OptionGroup} og
      WHERE og.OrgId = ? AND og.IsDeleted = 0
    `;

    const countResult = await this.unitOfWork.raw<{ total: number }[]>(countQuery, [
      this._callerService.tenantId,
    ]);
    const totalCount = countResult[0]?.total ?? 0;

    // Main query with nested options
    const query = `
      SELECT 
        og.Uid,
        og.OrgId,
        og.Name,
        og.Description,
        og.IsActive,
        og.CreatedOn,
        og.CreatedBy,
        og.UpdatedOn,
        og.UpdatedBy,
        (
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
              'Uid', opt.Uid,
              'OrgId', opt.OrgId,
              'OptionGroupId', opt.OptionGroupId,
              'Name', opt.Name,
              'Value', opt.Value,
              'SortOrder', opt.SortOrder
            )
          )
          FROM ${TableNames.Options} opt
          WHERE opt.OptionGroupId = og.Uid AND opt.IsDeleted = 0
          ORDER BY opt.SortOrder
        ) AS Options
      FROM ${TableNames.OptionGroup} og
      WHERE og.OrgId = ? AND og.IsDeleted = 0
      ORDER BY og.CreatedOn DESC
      LIMIT ? OFFSET ?
    `;

    const results = await this.unitOfWork.raw<OptionGroupResult[]>(query, [
      this._callerService.tenantId,
      pageSize,
      offset,
    ]);

    return {
      data: results,
      pagination: {
        total: totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
        hasNext: page < Math.ceil(totalCount / pageSize),
        hasPrevious: page > 1,
      },
    };
  }
}
