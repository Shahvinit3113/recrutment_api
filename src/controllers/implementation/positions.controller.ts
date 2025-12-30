import { Positions } from "@/data/entities/positions";
import { BaseController } from "../base/base.controller";
import { inject } from "inversify";
import { TYPES } from "@/core/container/types";
import { PositionsService } from "@/service/implementation/positions.service";
import { Filter } from "@/data/filters/filter";
import { authenticate } from "@/middleware/implementation/auth";
import { PositionsResult } from "@/data/results/position.result";
import { AutoController } from "@/core/container/auto-register";

@AutoController("/position", [authenticate])
export class PositionsController extends BaseController<Positions, Positions, Filter> {
  constructor(
    @inject(TYPES.PositionsService) positionsService: PositionsService
  ) {
    super(positionsService);
  }
}
