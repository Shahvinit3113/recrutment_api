import { Positions } from "@/data/entities/positions";
import { BaseRespository } from "../base/base.repository";
import { PositionsQuery } from "@/db/queries/positions.query";
import { DatabaseConnection } from "@/db/connection/connection";

export class PositionsRepository extends BaseRespository<
  Positions,
  PositionsQuery
> {
  constructor(db: DatabaseConnection) {
    super(db, new PositionsQuery());
  }
}
