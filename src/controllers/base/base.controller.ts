import { Delete, Get, Post, Put } from "@/core/decorators/route.decorator";
import { BaseEntities } from "@/data/entities/base-entities";
import { Filter } from "@/data/filters/filter";
import { Response as ApiResponse } from "@/data/response/response";
import { IService } from "@/service/interfaces";
import { Request, Response } from "express";

/**
 * Base controller that provides standard REST API endpoints for CRUD operations
 * 
 * Works with any service that implements IService (both VmService and BaseService)
 * 
 * @template TVm - View Model type for create/update operations
 * @template T - Entity type that extends BaseEntities
 * @template F - Filter type for search operations
 * @template TResult - Result type returned by operations
 */
export abstract class BaseController<
  TVm,
  T extends BaseEntities,
  F extends Filter,
  TResult
> {
  protected readonly _service: IService<T, TVm>;

  /**
   * Initializes a new instance of the base controller
   * @param service The service to handle business logic
   */
  constructor(service: IService<T, TVm>) {
    this._service = service;
  }

  /**
   * Retrieves all records
   * @param req Express request object containing filter criteria
   * @param res Express response object
   * @returns ApiResponse containing all matching records
   */
  @Post("/all")
  async getAll(
    req: Request<any, any, F, any>,
    res: Response<ApiResponse<any>>
  ) {
    return res.send(
      new ApiResponse(true, 200, "Success", await this._service.getAllAsync())
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
    req: Request<{ id: string }, any, any, any>,
    res: Response<ApiResponse<any>>
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
    req: Request<any, any, TVm, any>,
    res: Response<ApiResponse<any>>
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
    req: Request<{ id: string }, any, TVm, any>,
    res: Response<ApiResponse<any>>
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
    req: Request<{ id: string }, any, any, any>,
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
