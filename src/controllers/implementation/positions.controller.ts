import { Positions } from "@/data/entities/positions";
import { Result } from "@/data/response/response";
import { BaseController } from "../base/base.controller";
import { inject, injectable } from "inversify";
import { TYPES } from "@/core/container/types";
import { PositionsService } from "@/service/implementation/positions.service";
import { Filter } from "@/data/filters/filter";
import { controller } from "@/core/decorators/controller.decorator";
import { authenticate } from "@/middleware/implementation/auth";
import { PositionsResult } from "@/data/results/position.result";

@injectable()
@controller("/position", [authenticate])
export class PositionsController extends BaseController<
  Positions,
  Positions,
  Filter,
  Result<PositionsResult>
> {
  constructor(
    @inject(TYPES.PositionsService) positionsService: PositionsService
  ) {
    super(positionsService);
  }
}
