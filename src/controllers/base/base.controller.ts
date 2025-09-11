import { IBaseEntities } from "@/data/entities/base-entities";
import { Filter } from "@/data/filters/filter";
import { Response as DataResponse } from "@/data/response/response";
import { VmService } from "@/service/vm/vm.service";
import { Request, Response } from "express";

export class BaseController<
  TVm,
  T extends IBaseEntities,
  F extends Filter,
  TResult
> {
  constructor(protected service: VmService<TVm, T, F, TResult>) {}

  async getAll(
    req: Request<any, TResult, F, any>,
    res: Response<DataResponse<TResult>>
  ) {
    return res.send(
      new DataResponse(true, 200, "Success", await this.service.getAllAsync())
    );
  }

  async getById(
    req: Request<{ id: string }, TResult, any, any>,
    res: Response<DataResponse<TResult>>
  ) {
    return res.send(
      new DataResponse(
        true,
        200,
        "Success",
        await this.service.getByIdAsync(req.params.id)
      )
    );
  }

  async create(
    req: Request<any, TResult, TVm, any>,
    res: Response<DataResponse<TResult>>
  ) {
    return res.send(
      new DataResponse(
        true,
        200,
        "Success",
        await this.service.createAsync(req.body)
      )
    );
  }

  async update(
    req: Request<{ id: string }, TResult, TVm, any>,
    res: Response<DataResponse<TResult>>
  ) {
    return res.send(
      new DataResponse(
        true,
        200,
        "Success",
        await this.service.updateAsync(req.body, req.params.id)
      )
    );
  }

  async delete(
    req: Request<{ id: string }, DataResponse<boolean>, any, any>,
    res: Response<DataResponse<boolean>>
  ) {
    return res.send(
      new DataResponse(
        true,
        200,
        "Success",
        await this.service.deleteAsync(req.params.id)
      )
    );
  }
}
