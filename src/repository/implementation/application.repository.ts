import { DatabaseConnection } from "@/db/connection/connection";
import { Tables } from "@/db/helper/table";
import { BaseRepository } from "../base/base.repository";
import { Application } from "@/data/entities/application";

export class ApplicationRepository extends BaseRepository<Application> {
  constructor(db: DatabaseConnection) {
    super(db, Tables.Application);
  }
}
