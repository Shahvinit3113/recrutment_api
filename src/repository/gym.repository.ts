import { injectable, inject } from "inversify";
import { TYPES } from "@/core/container/types";
import { Respository } from "@/repository/implementation/repository";
import { IGym } from "@/data/entities/gym";
import { DatabaseConnection } from "@/db/connection/connection";
import { GymQueries } from "@/db/queries/gym.query";

@injectable()
export class GymRepository extends Respository<IGym> {
  constructor(@inject(TYPES.DatabaseConnection) db: DatabaseConnection) {
    super(db, new GymQueries());
  }
}
