import { Positions } from "@/data/entities/positions";
import { Result, Response as ApiResponse } from "@/data/response/response";
import { BaseController } from "../base/base.controller";
import { inject, injectable } from "inversify";
import { TYPES } from "@/core/container/types";
import { PositionsService } from "@/service/implementation/positions.service";
import { Filter } from "@/data/filters/filter";
import { controller } from "@/core/decorators/controller.decorator";
import { authenticate } from "@/middleware/implementation/auth";
import { initializeCaller } from "@/middleware/implementation/callerInit";
import { PositionsResult } from "@/data/results/position.result";
import { Get } from "@/core/decorators/route.decorator";
import { Request, Response } from "express";
import { Public } from "@/core/decorators/public.decorator";

@injectable()
@controller("/position", [initializeCaller, authenticate])
export class PositionsController extends BaseController<
  Positions,
  Positions,
  Filter,
  Result<PositionsResult>
> {
  //#region Service Initialization
  private readonly _positionsService: PositionsService;
  //#endregion
  constructor(
    @inject(TYPES.PositionsService) positionsService: PositionsService,
  ) {
    super(positionsService);
    this._positionsService = positionsService;
  }

  /**
   * Get all positions as public
   * @param req
   * @param res
   * @returns
   */
  @Public()
  @Get("/public/:orgId/all")
  async getAllPositionsAsPublic(
    req: Request<{ orgId: string }, unknown, unknown, unknown>,
    res: Response<ApiResponse<Result<Positions[]>>>,
  ): Promise<Response<ApiResponse<Result<Positions[]>>>> {
    return res.send(
      new ApiResponse(
        true,
        200,
        "Success",
        await this._positionsService.getAllPublicPositions(req.params.orgId),
      ),
    );
  }
}
