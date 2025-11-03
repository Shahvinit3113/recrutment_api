import { Positions } from "@/data/entities/positions";
import { VmService } from "../vm/vm.service";
import { Filter } from "@/data/filters/filter";
import { Result } from "@/data/response/response";
import { inject, injectable } from "inversify";
import { TYPES } from "@/core/container/types";
import { Repository } from "@/repository/base/repository";
import { CallerService } from "../caller/caller.service";
import { PositionsResult } from "@/data/results/position.result";

@injectable()
export class PositionsService extends VmService<
  Positions,
  Positions,
  Filter,
  Result<PositionsResult>
> {
  constructor(
    @inject(TYPES.Repository) repository: Repository,
    @inject(TYPES.Caller) callerService: CallerService
  ) {
    super(repository.Positions, callerService, Positions);
  }
}
