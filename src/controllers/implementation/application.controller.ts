import { Application } from "@/data/entities/application";
import { BaseController } from "../base/base.controller";
import { Filter } from "@/data/filters/filter";
import { Response as ApiResponse, Result } from "@/data/response/response";
import { inject, injectable } from "inversify";
import { TYPES } from "@/core/container/types";
import { ApplicationService } from "@/service/implementation/application.service";
import { controller } from "@/core/decorators/controller.decorator";
import { authenticate } from "@/middleware/implementation/auth";
import { Request, Response } from "express";
import { Post } from "@/core/decorators/route.decorator";
import { Public } from "@/core/decorators/public.decorator";

@injectable()
@controller("/application", [authenticate])
export class ApplicationController extends BaseController<
  Application,
  Application,
  Filter,
  Result<Application>
> {
  constructor(
    @inject(TYPES.ApplicationService) applicationService: ApplicationService
  ) {
    super(applicationService);
  }

  /**
   * Creates a new record
   * @param req Express request object containing the record data in body
   * @param res Express response object
   * @returns ApiResponse containing the created record
   */
  @Public()
  @Post("/")
  async create(
    req: Request<
      any,
      Result<Application>,
      Application,
      any,
      Record<string, any>
    >,
    res: Response<ApiResponse<Result<Application>>, Record<string, any>>
  ): Promise<Response<ApiResponse<Result<Application>>, Record<string, any>>> {
    return res.send(
      new ApiResponse(
        true,
        200,
        "Success",
        await this._service.createAsync(req.body)
      )
    );
  }
}
