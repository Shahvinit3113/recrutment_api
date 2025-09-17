import { BaseQueries } from "@/db/queries/base/base.query";
import { IGym } from "@/data/entities/gym";

export class GymQueries extends BaseQueries<IGym> {
  constructor() {
    super("Gyms");
  }
}
