import { Gym } from "@/data/entities/gym";
import { Result } from "@/data/response/response";
import { BaseController } from "../base/base.controller";
import { inject, injectable } from "inversify";
import { TYPES } from "@/core/container/types";
import { GymService } from "@/service/implementation/gym.service";
import { Filter } from "@/data/filters/filter";

@injectable()
export class GymController extends BaseController<
  Gym,
  Gym,
  Filter,
  Result<Gym>
> {
  constructor(@inject(TYPES.GymService) gymService: GymService) {
    super(gymService);
  }
}
