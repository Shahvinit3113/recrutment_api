import { Positions } from "@/data/entities/positions";
import { BaseRepository } from "../base/base.repository";
import { DatabaseConnection } from "@/db/connection/connection";
import { Tables } from "@/db/helper/table";

export class PositionsRepository extends BaseRepository<Positions> {
  constructor(db: DatabaseConnection) {
    super(db, Tables.Positions);
  }
}
