import { Delete, Get, Post, Put } from "@/core/decorators/route.decorator";
import { BaseEntities } from "@/data/entities/base-entities";
import { Filter, parsePagination } from "@/data/filters/filter";
import { Response as ApiResponse, SingleResult, PagedListResult } from "@/data/response/response";
import { VmService } from "@/service/vm/vm.service";
import { Response } from "express";
import { BodyRequest, ParamsRequest, TypedRequest, QueryRequest } from "@/core/types/express";

/**
 * Base controller that provides standard REST API endpoints for CRUD operations
 * @template TVm - View Model type for create/update operations
 * @template T - Entity type that extends IBaseEntities
 * @template F - Filter type for search operations
 */
export abstract class BaseController<
  TVm,
  T extends BaseEntities,
  F extends Filter
> {
  protected readonly _service: VmService<TVm, T, F>;

  /**
   * Initializes a new instance of the base controller
   * @param service The view model service to handle business logic
   */
  constructor(service: VmService<TVm, T, F>) {
    this._service = service;
  }

  /**
   * Retrieves all records with pagination
   * @param req Express request object containing filter criteria and pagination
   * @param res Express response object
   * @returns ApiResponse containing paginated results
   */
  @Post("/all")
  async getAll(
    req: TypedRequest<any, F, any>,
    res: Response<ApiResponse<PagedListResult<T>>>
  ) {
    const pagination = parsePagination(req.body);
    return res.send(
      new ApiResponse(true, 200, "Success", await this._service.getAllAsync(pagination))
    );
  }

  /**
   * Retrieves a record by its unique identifier
   * @param req Express request object containing the ID parameter
   * @param res Express response object
   * @returns ApiResponse containing the requested record
   */
  @Get("/:id")
  async getById(
    req: ParamsRequest<{ id: string }>,
    res: Response<ApiResponse<SingleResult<T>>>
  ) {
    return res.send(
      new ApiResponse(
        true,
        200,
        "Success",
        await this._service.getByIdAsync(req.params.id)
      )
    );
  }

  /**
   * Creates a new record
   * @param req Express request object containing the record data in body
   * @param res Express response object
   * @returns ApiResponse containing the created record
   */
  @Post("/")
  async create(
    req: BodyRequest<TVm>,
    res: Response<ApiResponse<SingleResult<T>>>
  ) {
    return res.send(
      new ApiResponse(
        true,
        200,
        "Success",
        await this._service.createAsync(req.body)
      )
    );
  }

  /**
   * Updates an existing record
   * @param req Express request object containing the ID parameter and update data
   * @param res Express response object
   * @returns ApiResponse containing the updated record
   */
  @Put("/:id")
  async update(
    req: TypedRequest<{ id: string }, TVm, any>,
    res: Response<ApiResponse<SingleResult<T>>>
  ) {
    return res.send(
      new ApiResponse(
        true,
        200,
        "Success",
        await this._service.updateAsync(req.body, req.params.id)
      )
    );
  }

  /**
   * Deletes a record by its unique identifier
   * @param req Express request object containing the ID parameter
   * @param res Express response object
   * @returns ApiResponse indicating success or failure
   */
  @Delete("/:id")
  async delete(
    req: ParamsRequest<{ id: string }>,
    res: Response<ApiResponse<boolean>>
  ) {
    return res.send(
      new ApiResponse(
        true,
        200,
        "Success",
        await this._service.deleteAsync(req.params.id)
      )
    );
  }
}
