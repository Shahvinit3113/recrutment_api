import { Delete, Get, Post, Put } from "@/core/decorators/route.decorator";
import { IBaseEntities } from "@/data/entities/base-entities";
import { Filter } from "@/data/filters/filter";
import { Response as ApiResponse } from "@/data/response/response";
import { VmService } from "@/service/vm/vm.service";
import { Request, Response } from "express";

export abstract class BaseController<
  TVm,
  T extends IBaseEntities,
  F extends Filter,
  TResult
> {
  protected readonly _service: VmService<TVm, T, F, TResult>;

  constructor(service: VmService<TVm, T, F, TResult>) {
    this._service = service;
  }

  @Post("/all")
  async getAll(
    req: Request<any, TResult, F, any>,
    res: Response<ApiResponse<TResult>>
  ) {
    return res.send(
      new ApiResponse(true, 200, "Success", await this._service.getAllAsync())
    );
  }

  @Get("/:id")
  async getById(
    req: Request<{ id: string }, TResult, any, any>,
    res: Response<ApiResponse<TResult>>
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

  @Post("/")
  async create(
    req: Request<any, TResult, TVm, any>,
    res: Response<ApiResponse<TResult>>
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

  @Put("/:id")
  async update(
    req: Request<{ id: string }, TResult, TVm, any>,
    res: Response<ApiResponse<TResult>>
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

  @Delete("/:id")
  async delete(
    req: Request<{ id: string }, ApiResponse<boolean>, any, any>,
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
