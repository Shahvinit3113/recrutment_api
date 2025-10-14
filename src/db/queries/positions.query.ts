import { Positions } from "@/data/entities/positions";
import { BaseQueries } from "./base/base.query";
import { Tables } from "../helper/table";

export class PositionsQuery extends BaseQueries<Positions> {
  constructor() {
    super(Tables.Positions);
  }
}
