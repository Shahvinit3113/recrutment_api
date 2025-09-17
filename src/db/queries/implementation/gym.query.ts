import { BaseQueries } from "@/db/queries/base/base.query";
import { IGym } from "@/data/entities/gym";
import { Tables } from "../../helper/table";

export class GymQueries extends BaseQueries<IGym> {
  constructor() {
    super(Tables.Gym);
  }
}
