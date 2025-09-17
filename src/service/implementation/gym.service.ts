import { inject, injectable } from "inversify";
import { VmService } from "@/service/vm/vm.service";
import { TYPES } from "@/core/container/types";
import { Gym } from "@/data/entities/gym";
import { GymRepository } from "@/repository/implementation/gym.repository";
import { Result } from "@/data/response/response";
import { Filter } from "@/data/filters/filter";
import { CallerService } from "@/service/caller/caller.service";

@injectable()
export class GymService extends VmService<Gym, Gym, Filter, Result<Gym>> {
  constructor(
    @inject(TYPES.GymRepository) _repository: GymRepository,
    @inject(TYPES.Caller) _callerService: CallerService
  ) {
    super(_repository, _callerService, Gym);
  }
}
